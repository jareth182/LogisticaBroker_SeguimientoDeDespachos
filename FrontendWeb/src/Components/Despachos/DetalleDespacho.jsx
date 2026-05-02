import { useState, useEffect, useCallback } from 'react';

const API_DAM = 'http://localhost:5018/api/DAM';

// ── Tasas de tributos (hardcodeadas, referencia SUNAT) ────────
const TRIBUTOS = [
    { nombre: 'Ad Valorem', tasa: 0.06  },
    { nombre: 'IGV',        tasa: 0.18  },
    { nombre: 'IPM',        tasa: 0.02  },
];

// ── Step Indicator ────────────────────────────────────────────
function StepIndicator({ paso, setPaso, bloqueado }) {
    const pasos = [
        { id: 1, label: 'Datos generales',   sub: 'Autocompletados'      },
        { id: 2, label: 'Datos de factura',  sub: 'Ingresa montos'       },
        { id: 3, label: 'Revisión y resumen',sub: 'Verifica cálculos'    },
        { id: 4, label: 'Finalizar',         sub: 'Generar oficial'      },
    ];
    return (
        <div className="flex items-center gap-0 mb-6">
            {pasos.map((p, i) => {
                const activo   = paso === p.id;
                const completo = paso > p.id;
                return (
                    <div key={p.id} className="flex items-center">
                        <button
                            onClick={() => !bloqueado && setPaso(p.id)}
                            className="flex items-center gap-2 group"
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                                completo ? 'bg-[#008b9c] text-white' :
                                activo   ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' :
                                           'bg-gray-100 text-gray-400 border-2 border-gray-200'
                            }`}>
                                {completo
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    : p.id
                                }
                            </div>
                            <div className="text-left">
                                <p className={`text-xs font-bold leading-tight ${activo || completo ? 'text-[#008b9c]' : 'text-gray-400'}`}>{p.label}</p>
                                <p className="text-[10px] text-gray-400">{p.sub}</p>
                            </div>
                        </button>
                        {i < pasos.length - 1 && (
                            <div className={`w-10 h-0.5 mx-3 transition-all duration-500 ${completo ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Campo texto ───────────────────────────────────────────────
function Campo({ label, value, onChange, disabled, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <input type="text" value={value} onChange={onChange} disabled={disabled} placeholder={placeholder}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500" />
        </div>
    );
}

// ── Campo moneda ──────────────────────────────────────────────
function CampoMoneda({ label, value, onChange, disabled }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                <input type="number" min="0" step="0.01" value={value} onChange={onChange} disabled={disabled} placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
        </div>
    );
}

export default function DetalleDespacho({ despacho, onVolver, onVerLiquidaciones }) {
    const [paso, setPaso]                     = useState(1);
    const [damExistente, setDamExistente]     = useState(null);
    const [bloqueado, setBloqueado]           = useState(false);
    const [loadingDam, setLoadingDam]         = useState(true);
    const [etapas, setEtapas]                 = useState([]);

    // Paso 1 — Datos Generales
    const [importadorExportador, setImportadorExportador] = useState('');
    const [codDocIdentificacion, setCodDocIdentificacion] = useState('');
    const [direccionImportador, setDireccionImportador]   = useState('');
    const [empresaTransporte, setEmpresaTransporte]       = useState('');
    const [viaTransporte, setViaTransporte]               = useState('Marítimo');
    const [puertoEmbarque, setPuertoEmbarque]             = useState('');
    const [terminalAlmacenamiento, setTerminalAlmacenamiento] = useState('');

    // Paso 2 — Valores
    const [valorFob, setValorFob]         = useState('');
    const [flete, setFlete]               = useState('');
    const [seguro, setSeguro]             = useState('');
    const [totalAjustes, setTotalAjustes] = useState('');

    // UI
    const [loading, setLoading]           = useState(false);
    const [mensaje, setMensaje]           = useState(null);
    const [autoguardado, setAutoguardado] = useState(null);

    // CIF
    const cifVal = (parseFloat(valorFob)||0) + (parseFloat(flete)||0) + (parseFloat(seguro)||0) + (parseFloat(totalAjustes)||0);
    const valorCif = cifVal.toFixed(2);

    // Simulación tributos
    const tributosSim = TRIBUTOS.map(t => ({
        ...t,
        baseImponible: cifVal,
        monto: cifVal * t.tasa,
    }));
    const totalTributos = tributosSim.reduce((s, t) => s + t.monto, 0);

    // Cargar DAM y etapas
    useEffect(() => {
        const cargar = async () => {
            setLoadingDam(true);
            try {
                const res = await fetch(`${API_DAM}/${despacho.idDespacho}/borrador`);
                if (res.ok) {
                    const dam = await res.json();
                    setDamExistente(dam);
                    setBloqueado(dam.edicionBloqueada);
                    setImportadorExportador(dam.importadorExportador || despacho.razonSocial || '');
                    setCodDocIdentificacion(dam.codDocIdentificacion || despacho.ruc || '');
                    setDireccionImportador(dam.direccionImportador || '');
                    setEmpresaTransporte(dam.empresaTransporte || '');
                    setViaTransporte(dam.viaTransporte || 'Marítimo');
                    setPuertoEmbarque(dam.puertoEmbarque || '');
                    setTerminalAlmacenamiento(dam.terminalAlmacenamiento || '');
                    setValorFob(dam.valorFob?.toString() || '');
                    setFlete(dam.flete?.toString() || '');
                    setSeguro(dam.seguro?.toString() || '');
                    setTotalAjustes(dam.totalAjustes?.toString() || '');
                    if (dam.edicionBloqueada) setPaso(4);
                } else {
                    const local = localStorage.getItem(`dam_borrador_${despacho.idDespacho}`);
                    if (local) {
                        const d = JSON.parse(local);
                        setImportadorExportador(d.importadorExportador || despacho.razonSocial || '');
                        setCodDocIdentificacion(d.codDocIdentificacion || despacho.ruc || '');
                        setDireccionImportador(d.direccionImportador || '');
                        setEmpresaTransporte(d.empresaTransporte || '');
                        setViaTransporte(d.viaTransporte || 'Marítimo');
                        setPuertoEmbarque(d.puertoEmbarque || '');
                        setTerminalAlmacenamiento(d.terminalAlmacenamiento || '');
                        setValorFob(d.valorFob || '');
                        setFlete(d.flete || '');
                        setSeguro(d.seguro || '');
                        setTotalAjustes(d.totalAjustes || '');
                        setAutoguardado('recuperado');
                    } else {
                        setImportadorExportador(despacho.razonSocial || '');
                        setCodDocIdentificacion(despacho.ruc || '');
                        setPuertoEmbarque(despacho.origen || '');
                    }
                    setDamExistente(null);
                    setBloqueado(false);
                }
                const resEtapas = await fetch(`${API_DAM}/${despacho.idDespacho}/etapas`);
                if (resEtapas.ok) setEtapas(await resEtapas.json());
            } catch (e) { console.error(e); }
            finally { setLoadingDam(false); }
        };
        cargar();
    }, [despacho.idDespacho]);

    // Autoguardado
    const guardarLocal = useCallback(() => {
        const datos = { importadorExportador, codDocIdentificacion, direccionImportador, empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento, valorFob, flete, seguro, totalAjustes };
        localStorage.setItem(`dam_borrador_${despacho.idDespacho}`, JSON.stringify(datos));
        setAutoguardado(new Date().toLocaleTimeString());
    }, [importadorExportador, codDocIdentificacion, direccionImportador, empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento, valorFob, flete, seguro, totalAjustes, despacho.idDespacho]);

    useEffect(() => {
        if (bloqueado || loadingDam) return;
        const timer = setTimeout(guardarLocal, 2000);
        return () => clearTimeout(timer);
    }, [guardarLocal, bloqueado, loadingDam]);

    const buildBody = () => {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        return {
            idDespacho: despacho.idDespacho,
            idUsuarioCreador: usuario.idUsuario || 2,
            importadorExportador, codDocIdentificacion, direccionImportador,
            empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
            valorFob: parseFloat(valorFob) || 0,
            flete: parseFloat(flete) || 0,
            seguro: parseFloat(seguro) || 0,
            totalAjustes: parseFloat(totalAjustes) || 0,
        };
    };

    const handleGuardarBorrador = async () => {
        setLoading(true); setMensaje(null);
        try {
            const res = await fetch(
                damExistente ? `${API_DAM}/${despacho.idDespacho}/borrador` : `${API_DAM}/generar-borrador`,
                { method: damExistente ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildBody()) }
            );
            const data = await res.json();
            if (res.ok) {
                setDamExistente(data);
                setMensaje({ tipo: 'exito', texto: '¡Borrador guardado! El expediente permanece editable.' });
                localStorage.removeItem(`dam_borrador_${despacho.idDespacho}`);
                setAutoguardado(null);
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al guardar.' });
            }
        } catch { setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' }); }
        finally { setLoading(false); }
    };

    const handleGenerarOficial = async () => {
        if (!damExistente) { setMensaje({ tipo: 'error', texto: 'Primero guarda el borrador.' }); return; }
        if (!window.confirm('¿Estás seguro? El formulario se bloqueará y el despacho avanzará a "Liquidación Terminada".')) return;
        setLoading(true); setMensaje(null);
        try {
            const res = await fetch(`${API_DAM}/${despacho.idDespacho}/finalizar`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await res.json();
            if (res.ok) { setBloqueado(true); setMensaje({ tipo: 'exito', texto: '¡DAM Oficial generada! El formulario ha sido bloqueado.' }); }
            else { setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al finalizar.' }); }
        } catch { setMensaje({ tipo: 'error', texto: 'No se pudo conectar.' }); }
        finally { setLoading(false); }
    };

    const estadoBadgeClass = (estado) => {
        if (!estado) return 'bg-gray-100 text-gray-600';
        const k = estado.toLowerCase();
        if (k.includes('apertura'))  return 'bg-orange-100 text-orange-700';
        if (k.includes('liquidaci')) return 'bg-blue-100 text-blue-700';
        if (k.includes('terminada') || k.includes('finaliz')) return 'bg-green-100 text-green-700';
        return 'bg-gray-100 text-gray-600';
    };

    if (loadingDam) return (
        <div className="flex items-center justify-center h-64">
            <svg className="w-8 h-8 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Despachos</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-600 font-medium">{despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Liquidación</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-500">Borrador</span>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#e0f7fa] rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-lg font-bold text-gray-900">Borrador de Liquidación</h1>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${estadoBadgeClass(bloqueado ? 'Liquidación Terminada' : despacho.estado)}`}>
                                    {bloqueado ? 'Liquidación Terminada' : (despacho.estado || 'En Apertura')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Despacho: <span className="font-semibold text-gray-700">{despacho.codigoOrden}</span>
                                {' · '}Cliente: <span className="font-semibold text-gray-700">{despacho.razonSocial}</span>
                                {' · '}BL: <span className="font-mono text-gray-600">{despacho.codigoBl}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onVolver}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Volver al despacho
                    </button>
                </div>
            </div>

            <div className="flex gap-5">

                {/* ── Columna principal ── */}
                <div className="flex-1 min-w-0">

                    {/* Steps */}
                    <StepIndicator paso={paso} setPaso={setPaso} bloqueado={bloqueado} />

                    {/* Mensaje */}
                    {mensaje && (
                        <div className={`p-3 mb-4 rounded-lg text-sm font-medium flex items-start gap-3 ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {mensaje.tipo === 'exito'
                                ? <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                : <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Card del paso */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

                        {/* Header del paso */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">{paso}</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">
                                        {paso === 1 && 'Datos generales'}
                                        {paso === 2 && 'Datos de la factura e importes'}
                                        {paso === 3 && 'Revisión y resumen'}
                                        {paso === 4 && 'Finalizar'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {paso === 1 && 'Autocompletados desde el expediente'}
                                        {paso === 2 && 'Ingresa los montos en USD'}
                                        {paso === 3 && 'Verifica los cálculos antes de finalizar'}
                                        {paso === 4 && 'Genera el documento oficial'}
                                    </p>
                                </div>
                            </div>
                            {autoguardado && !bloqueado && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    {autoguardado === 'recuperado' ? 'Datos recuperados' : `Autoguardado ${autoguardado}`}
                                </div>
                            )}
                        </div>

                        <div className="p-6">

                            {/* ════ PASO 1: Datos Generales ════ */}
                            {paso === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[#008b9c] bg-[#e0f7fa] px-2 py-0.5 rounded-full font-medium">Autocompletados desde el expediente</span>
                                    </div>
                                    {bloqueado && <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-3 py-2">Formulario bloqueado tras la generación oficial.</p>}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Campo label="Importador / Exportador" value={importadorExportador} onChange={e => setImportadorExportador(e.target.value)} disabled={bloqueado} placeholder="Ej. INVERSIONES SERAMAR S.A.C." />
                                        <Campo label="Cod. y Doc. de Identificación" value={codDocIdentificacion} onChange={e => setCodDocIdentificacion(e.target.value)} disabled={bloqueado} placeholder="Ej. 20545989043" />
                                    </div>
                                    <Campo label="Dirección del Importador" value={direccionImportador} onChange={e => setDireccionImportador(e.target.value)} disabled={bloqueado} placeholder="Ej. JR. ANDAHUAYLAS NRO. 956" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Campo label="Empresa de Transporte" value={empresaTransporte} onChange={e => setEmpresaTransporte(e.target.value)} disabled={bloqueado} placeholder="Ej. TERMINALES PORTUARIOS PERUANOS SAC" />
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Vía de Transporte</label>
                                            <select value={viaTransporte} onChange={e => setViaTransporte(e.target.value)} disabled={bloqueado}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] outline-none disabled:bg-gray-50 disabled:text-gray-400">
                                                <option>Marítimo</option><option>Aéreo</option><option>Terrestre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Campo label="Puerto de Embarque" value={puertoEmbarque} onChange={e => setPuertoEmbarque(e.target.value)} disabled={bloqueado} placeholder="Ej. YANTIAN" />
                                        <Campo label="Terminal de Almacenamiento" value={terminalAlmacenamiento} onChange={e => setTerminalAlmacenamiento(e.target.value)} disabled={bloqueado} placeholder="Ej. OPERADORES LOGISTIX PERU S.A.C." />
                                    </div>
                                </div>
                            )}

                            {/* ════ PASO 2: Valores Aduaneros ════ */}
                            {paso === 2 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-gray-500">Ingresa los montos en Dólares Americanos (USD). El sistema calculará automáticamente la Base Imponible (CIF).</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <CampoMoneda label="Valor FOB (USD) *" value={valorFob} onChange={e => setValorFob(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Flete Int. (USD) *" value={flete} onChange={e => setFlete(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Seguro (USD) *" value={seguro} onChange={e => setSeguro(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Total Ajustes (USD)" value={totalAjustes} onChange={e => setTotalAjustes(e.target.value)} disabled={bloqueado} />
                                    </div>
                                    <div className="p-4 bg-[#f0fdfa] border border-[#99f6e4] rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-[#0f766e] uppercase tracking-wider">Base Imponible (Valor CIF) USD</p>
                                            <p className="text-xs text-[#14b8a6] mt-0.5">Cálculo automático: CIF = FOB + Flete + Seguro</p>
                                        </div>
                                        <span className="text-3xl font-bold text-[#0f766e]">$ {valorCif}</span>
                                    </div>
                                </div>
                            )}

                            {/* ════ PASO 3: Revisión y Resumen ════ */}
                            {paso === 3 && (
                                <div className="space-y-5">
                                    {/* Resumen liquidación */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">Resumen de la liquidación</h3>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                                            {[
                                                { label: 'Valor FOB (USD)',    value: `$ ${(parseFloat(valorFob)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                                { label: 'Flete (USD)',        value: `$ ${(parseFloat(flete)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                                { label: 'Seguro (USD)',       value: `$ ${(parseFloat(seguro)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                            ].map(r => (
                                                <div key={r.label} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 text-sm">
                                                    <span className="text-gray-500">{r.label}</span>
                                                    <span className="font-semibold text-gray-700">{r.value}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center px-4 py-3 bg-[#f0fdfa]">
                                                <span className="text-sm font-bold text-[#0f766e]">Base Imponible (CIF) USD</span>
                                                <span className="text-lg font-bold text-[#0f766e]">$ {parseFloat(valorCif).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Simulación tributos */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-1">Resumen de tributos (Simulación)</h3>
                                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Esta es una simulación informativa. Los montos finales pueden variar según validaciones de SUNAT.
                                        </p>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                                        <th className="px-4 py-3 text-left">Tributo</th>
                                                        <th className="px-4 py-3 text-right">Tasa</th>
                                                        <th className="px-4 py-3 text-right">Base Imponible (USD)</th>
                                                        <th className="px-4 py-3 text-right">Monto (USD)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {tributosSim.map(t => (
                                                        <tr key={t.nombre}>
                                                            <td className="px-4 py-3 font-semibold text-gray-700">{t.nombre}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600">{(t.tasa * 100).toFixed(0)}%</td>
                                                            <td className="px-4 py-3 text-right text-gray-600">$ {t.baseImponible.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">$ {t.monto.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-[#f0fdfa]">
                                                        <td colSpan="3" className="px-4 py-3 font-bold text-[#0f766e]">Total Tributos (USD)</td>
                                                        <td className="px-4 py-3 text-right font-bold text-[#0f766e] text-base">$ {totalTributos.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════ PASO 4: Finalizar ════ */}
                            {paso === 4 && (
                                <div className="space-y-5">
                                    {/* Datos generales resumen */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">Datos generales</h3>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                                            {[
                                                { label: 'Importador',           value: importadorExportador },
                                                { label: 'Identificación',       value: codDocIdentificacion },
                                                { label: 'Dirección',            value: direccionImportador || '—' },
                                                { label: 'Empresa Transporte',   value: empresaTransporte || '—' },
                                                { label: 'Vía de Transporte',    value: viaTransporte },
                                                { label: 'Puerto de Embarque',   value: puertoEmbarque || '—' },
                                                { label: 'Terminal Almacenamiento', value: terminalAlmacenamiento || '—' },
                                            ].map(f => (
                                                <div key={f.label}>
                                                    <p className="text-gray-400 font-medium">{f.label}</p>
                                                    <p className="text-gray-800 font-semibold truncate">{f.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Valores aduaneros resumen */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">Valores aduaneros</h3>
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                                            {[
                                                { label: 'Valor FOB', value: `$ ${(parseFloat(valorFob)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                                { label: 'Flete',     value: `$ ${(parseFloat(flete)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                                { label: 'Seguro',    value: `$ ${(parseFloat(seguro)||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                            ].map(r => (
                                                <div key={r.label} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 text-sm">
                                                    <span className="text-gray-500">{r.label}</span>
                                                    <span className="font-semibold text-gray-700">{r.value}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center px-4 py-3 bg-[#f0fdfa]">
                                                <span className="text-sm font-bold text-[#0f766e]">Base Imponible (CIF)</span>
                                                <span className="text-lg font-bold text-[#0f766e]">$ {parseFloat(valorCif).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total tributos */}
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Total estimado de tributos</p>
                                            <p className="text-xs text-amber-600 mt-0.5">Simulación informativa — puede variar según SUNAT</p>
                                        </div>
                                        <span className="text-2xl font-bold text-amber-700">$ {totalTributos.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                                    </div>

                                    {bloqueado && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-sm font-semibold text-green-800">DAM Oficial generada — formulario bloqueado</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                            <div className="flex gap-2">
                                {paso > 1 && (
                                    <button onClick={() => setPaso(p => p - 1)}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                        Anterior
                                    </button>
                                )}
                                <button onClick={handleGuardarBorrador} disabled={loading || bloqueado}
                                    className={`flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors ${loading || bloqueado ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    {loading ? 'Guardando...' : 'Guardar Borrador'}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {paso < 4 ? (
                                    <button onClick={() => setPaso(p => p + 1)}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm">
                                        Siguiente
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        {onVerLiquidaciones && (
                                            <button onClick={() => onVerLiquidaciones(despacho)}
                                                className="flex items-center gap-2 px-4 py-2 border border-[#008b9c] text-[#008b9c] text-sm font-semibold rounded-lg hover:bg-[#e0f7fa] transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                                Ver liquidaciones
                                            </button>
                                        )}
                                        <button onClick={handleGenerarOficial} disabled={loading || bloqueado || !damExistente}
                                            className={`flex items-center gap-2 px-5 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#007685] transition-colors ${loading || bloqueado || !damExistente ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            {bloqueado ? 'DAM Finalizada' : 'Generar Oficial'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Panel lateral ── */}
                <div className="w-60 shrink-0 space-y-4">

                    {/* Estado */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado del despacho</p>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${estadoBadgeClass(bloqueado ? 'Liquidación Terminada' : despacho.estado)}`}>
                            {bloqueado ? 'Liquidación Terminada' : (despacho.estado || 'En Apertura')}
                        </span>
                        <div className="mt-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tarea actual</p>
                            <p className="text-sm font-semibold text-gray-800">{bloqueado ? 'Numeración oficial' : 'Liquidación de tributos'}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${bloqueado ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {bloqueado ? 'Finalizado' : 'En Proceso'}
                            </span>
                        </div>
                    </div>

                    {/* Flujo */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Flujo del despacho</p>
                        <div className="space-y-3">
                            {etapas.length === 0
                                ? <p className="text-xs text-gray-400">Cargando etapas...</p>
                                : etapas.map((etapa, i) => {
                                    const finalizado = etapa.estado === 'Completado' || etapa.estado === 'Finalizado';
                                    const enProceso  = etapa.estado === 'En Proceso';
                                    return (
                                        <div key={etapa.idTipoEtapa} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${finalizado ? 'bg-[#008b9c] text-white' : enProceso ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' : 'bg-gray-100 text-gray-400'}`}>
                                                    {finalizado ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : etapa.orden}
                                                </div>
                                                {i < etapas.length - 1 && <div className={`w-0.5 h-5 mt-1 ${finalizado ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />}
                                            </div>
                                            <div className="pt-0.5">
                                                <p className={`text-xs font-semibold leading-tight ${enProceso ? 'text-[#008b9c]' : finalizado ? 'text-gray-600' : 'text-gray-400'}`}>{etapa.nombre}</p>
                                                {enProceso  && <span className="text-[10px] text-[#008b9c] font-medium">En Proceso</span>}
                                                {finalizado && <span className="text-[10px] text-gray-400">Finalizado</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>

                    {/* Expediente DAM */}
                    {damExistente && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Expediente DAM</p>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-gray-400">ID DAM</span><span className="font-mono font-semibold">#{damExistente.idDam}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Estado</span><span className={`font-semibold ${bloqueado ? 'text-green-600' : 'text-blue-600'}`}>{bloqueado ? 'Finalizado' : 'Borrador'}</span></div>
                                {damExistente.fechaCreacion && <div className="flex justify-between"><span className="text-gray-400">Creado</span><span>{new Date(damExistente.fechaCreacion).toLocaleDateString()}</span></div>}
                                {damExistente.fechaFinalizacion && <div className="flex justify-between"><span className="text-gray-400">Finalizado</span><span>{new Date(damExistente.fechaFinalizacion).toLocaleDateString()}</span></div>}
                            </div>
                        </div>
                    )}

                    {/* Siguiente responsable */}
                    {!bloqueado && (
                        <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Siguiente responsable</p>
                            <p className="text-xs font-semibold text-gray-700">Soporte Administrativo</p>
                            <p className="text-[10px] text-gray-400 mt-1">Una vez terminada la liquidación, se continuará con la generación de la DAM.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}