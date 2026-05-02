import { useState, useEffect, useCallback } from 'react';
import AsignarPartida from './AsignarPartida';

const API_DAM = 'http://localhost:5018/api/DAM';

// ── Flujo de pasos del despacho ───────────────────────────────
const PASOS_FLUJO = [
    { id: 1, label: 'Creación de despacho' },
    { id: 2, label: 'Clasificación' },
    { id: 3, label: 'Liquidación de tributos' },
    { id: 4, label: 'Generación DAM' },
    { id: 5, label: 'Numeración oficial' },
];

export default function DetalleDespacho({ despacho, onVolver }) {
    // ── Tabs del formulario DAM ───────────────────────────────
    const [tab, setTab] = useState('generales');

    // ── Estado DAM ────────────────────────────────────────────
    const [damExistente, setDamExistente] = useState(null);
    const [bloqueado, setBloqueado]       = useState(false);
    const [loadingDam, setLoadingDam]     = useState(true);
    const [etapas, setEtapas] = useState([]);

    // ── Pestaña 1: Datos Generales ────────────────────────────
    const [importadorExportador, setImportadorExportador] = useState('');
    const [codDocIdentificacion, setCodDocIdentificacion] = useState('');
    const [direccionImportador, setDireccionImportador]   = useState('');
    const [empresaTransporte, setEmpresaTransporte]       = useState('');
    const [viaTransporte, setViaTransporte]               = useState('Marítimo');
    const [puertoEmbarque, setPuertoEmbarque]             = useState('');
    const [terminalAlmacenamiento, setTerminalAlmacenamiento] = useState('');

    // ── Pestaña 2: Valores Aduaneros ──────────────────────────
    const [valorFob, setValorFob]         = useState('');
    const [flete, setFlete]               = useState('');
    const [seguro, setSeguro]             = useState('');
    const [totalAjustes, setTotalAjustes] = useState('');

    // ── UI ────────────────────────────────────────────────────
    const [loading, setLoading]           = useState(false);
    const [mensaje, setMensaje]           = useState(null);
    const [autoguardado, setAutoguardado] = useState(null);

    // ── CIF automático ────────────────────────────────────────
    const valorCif = (
        (parseFloat(valorFob)      || 0) +
        (parseFloat(flete)         || 0) +
        (parseFloat(seguro)        || 0) +
        (parseFloat(totalAjustes)  || 0)
    ).toFixed(2);

    // ── Paso activo en el flujo ───────────────────────────────
    const pasoActivo = () => {
        if (!damExistente) return 3; // en liquidación
        if (bloqueado)     return 5;
        return 4;
    };

    // ── Cargar DAM existente al montar ────────────────────────
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
                } else {
                    // No existe DAM — revisar localStorage primero
                    const local = localStorage.getItem(`dam_borrador_${despacho.idDespacho}`);
                    if (local) {
                        const datos = JSON.parse(local);
                        setImportadorExportador(datos.importadorExportador || despacho.razonSocial || '');
                        setCodDocIdentificacion(datos.codDocIdentificacion || despacho.ruc || '');
                        setDireccionImportador(datos.direccionImportador || '');
                        setEmpresaTransporte(datos.empresaTransporte || '');
                        setViaTransporte(datos.viaTransporte || 'Marítimo');
                        setPuertoEmbarque(datos.puertoEmbarque || '');
                        setTerminalAlmacenamiento(datos.terminalAlmacenamiento || '');
                        setValorFob(datos.valorFob || '');
                        setFlete(datos.flete || '');
                        setSeguro(datos.seguro || '');
                        setTotalAjustes(datos.totalAjustes || '');
                        setAutoguardado('recuperado');
                    } else {
                        // Autocompletar con datos del despacho
                        setImportadorExportador(despacho.razonSocial || '');
                        setCodDocIdentificacion(despacho.ruc || '');
                        setPuertoEmbarque(despacho.origen || '');
                    }
                    setDamExistente(null);
                    setBloqueado(false);
                }
                // Cargar etapas reales
                const resEtapas = await fetch(`${API_DAM}/${despacho.idDespacho}/etapas`);
                if (resEtapas.ok) setEtapas(await resEtapas.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingDam(false);
            }
        };
        cargar();
    }, [despacho.idDespacho]);

    // ── Autoguardado en localStorage ──────────────────────────
    const guardarLocal = useCallback(() => {
        const datos = {
            importadorExportador, codDocIdentificacion, direccionImportador,
            empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
            valorFob, flete, seguro, totalAjustes
        };
        localStorage.setItem(`dam_borrador_${despacho.idDespacho}`, JSON.stringify(datos));
        setAutoguardado(new Date().toLocaleTimeString());
    }, [importadorExportador, codDocIdentificacion, direccionImportador,
        empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
        valorFob, flete, seguro, totalAjustes, despacho.idDespacho]);

    useEffect(() => {
        if (bloqueado || loadingDam) return;
        const timer = setTimeout(guardarLocal, 2000);
        return () => clearTimeout(timer);
    }, [guardarLocal, bloqueado, loadingDam]);

    // ── Payload compartido ────────────────────────────────────
    const buildBody = () => {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        return {
            idDespacho: despacho.idDespacho,
            idUsuarioCreador: usuario.idUsuario || 2,
            importadorExportador, codDocIdentificacion, direccionImportador,
            empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
            valorFob:      parseFloat(valorFob)      || 0,
            flete:         parseFloat(flete)         || 0,
            seguro:        parseFloat(seguro)        || 0,
            totalAjustes:  parseFloat(totalAjustes)  || 0,
        };
    };

    // ── Guardar Borrador ──────────────────────────────────────
    const handleGuardarBorrador = async () => {
        setLoading(true);
        setMensaje(null);
        try {
            let res;
            if (damExistente) {
                res = await fetch(`${API_DAM}/${despacho.idDespacho}/borrador`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildBody())
                });
            } else {
                res = await fetch(`${API_DAM}/generar-borrador`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildBody())
                });
            }
            const data = await res.json();
            if (res.ok) {
                setDamExistente(data);
                setMensaje({ tipo: 'exito', texto: '¡Borrador guardado! El expediente permanece editable.' });
                localStorage.removeItem(`dam_borrador_${despacho.idDespacho}`);
                setAutoguardado(null);
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al guardar el borrador.' });
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Generar Oficial ───────────────────────────────────────
    const handleGenerarOficial = async () => {
        if (!damExistente) {
            setMensaje({ tipo: 'error', texto: 'Primero guarda el borrador antes de generar el oficial.' });
            return;
        }
        if (!window.confirm('¿Estás seguro? El formulario se bloqueará y el despacho avanzará a "Liquidación Terminada".')) return;

        setLoading(true);
        setMensaje(null);
        try {
            const res = await fetch(`${API_DAM}/${despacho.idDespacho}/finalizar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                setBloqueado(true);
                setMensaje({ tipo: 'exito', texto: '¡DAM Oficial generada! El formulario ha sido bloqueado.' });
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al finalizar la DAM.' });
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoading(false);
        }
    };

    const estadoClass = (estado) => {
        if (!estado) return 'bg-gray-100 text-gray-600';
        const k = estado.toLowerCase();
        if (k.includes('apertura'))  return 'bg-orange-100 text-orange-700';
        if (k.includes('liquidaci')) return 'bg-blue-100 text-blue-700';
        if (k.includes('terminada') || k.includes('finaliz')) return 'bg-green-100 text-green-700';
        return 'bg-gray-100 text-gray-600';
    };

    if (loadingDam) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-gray-400">Cargando expediente...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">
                    Despachos
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-600 font-medium">{despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[#008b9c] font-semibold">Borrador DAM</span>
            </div>

            {/* ── Header del despacho ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                Borrador de Liquidación
                            </h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${estadoClass(bloqueado ? 'Liquidación Terminada' : despacho.estado)}`}>
                                {bloqueado ? 'LIQUIDACIÓN TERMINADA' : (despacho.estado || 'En Apertura').toUpperCase()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {despacho.codigoOrden} · {despacho.razonSocial} · BL: <span className="font-mono">{despacho.codigoBl}</span>
                        </p>
                    </div>
                    <button
                        onClick={onVolver}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al despacho
                    </button>
                </div>
            </div>

            <div className="flex gap-5">

                {/* ── Formulario principal (izquierda) ── */}
                <div className="flex-1 min-w-0">

                    {/* Mensaje */}
                    {mensaje && (
                        <div className={`p-4 mb-4 rounded-lg text-sm font-medium flex items-start gap-3 ${
                            mensaje.tipo === 'exito'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {mensaje.tipo === 'exito'
                                ? <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                : <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Card formulario */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

                        {/* Tabs */}
                        <div className="border-b border-gray-200 px-6 pt-4 flex items-center justify-between">
                            <div className="flex gap-6">
                                {[
                                    { id: 'generales', label: '1. Datos Generales' },
                                    { id: 'valores',   label: '2. Datos de Factura' },
                                    { id: 'partidas',  label: '3. Partidas' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                                            tab === t.id
                                                ? 'border-[#008b9c] text-[#008b9c]'
                                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            {autoguardado && !bloqueado && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600 pb-3">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {autoguardado === 'recuperado' ? 'Datos recuperados' : `Autoguardado ${autoguardado}`}
                                </div>
                            )}
                        </div>

                        <div className="p-6">

                            {/* ── Tab 1: Datos Generales ── */}
                            {tab === 'generales' && (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Datos generales</h3>
                                        <span className="text-xs text-[#008b9c] bg-[#e0f7fa] px-2 py-0.5 rounded-full">Autocompletados desde el expediente</span>
                                    </div>
                                    {bloqueado && (
                                        <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-3 py-2">
                                            Este formulario ha sido bloqueado tras la generación oficial.
                                        </p>
                                    )}
                                    <div className="grid grid-cols-2 gap-5">
                                        <Campo label="Importador / Exportador" value={importadorExportador}
                                            onChange={e => setImportadorExportador(e.target.value)} disabled={bloqueado}
                                            placeholder="Ej. INVERSIONES SERAMAR S.A.C." />
                                        <Campo label="Cod. y Doc. de Identificación" value={codDocIdentificacion}
                                            onChange={e => setCodDocIdentificacion(e.target.value)} disabled={bloqueado}
                                            placeholder="Ej. 20545989043" />
                                    </div>
                                    <Campo label="Dirección del Importador" value={direccionImportador}
                                        onChange={e => setDireccionImportador(e.target.value)} disabled={bloqueado}
                                        placeholder="Ej. JR. ANDAHUAYLAS NRO. 956" />
                                    <div className="grid grid-cols-2 gap-5">
                                        <Campo label="Empresa de Transporte" value={empresaTransporte}
                                            onChange={e => setEmpresaTransporte(e.target.value)} disabled={bloqueado}
                                            placeholder="Ej. TERMINALES PORTUARIOS PERUANOS SAC" />
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Vía de Transporte</label>
                                            <select
                                                value={viaTransporte}
                                                onChange={e => setViaTransporte(e.target.value)}
                                                disabled={bloqueado}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                            >
                                                <option>Marítimo</option>
                                                <option>Aéreo</option>
                                                <option>Terrestre</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Campo label="Puerto de Embarque" value={puertoEmbarque}
                                            onChange={e => setPuertoEmbarque(e.target.value)} disabled={bloqueado}
                                            placeholder="Ej. YANTIAN" />
                                        <Campo label="Terminal de Almacenamiento" value={terminalAlmacenamiento}
                                            onChange={e => setTerminalAlmacenamiento(e.target.value)} disabled={bloqueado}
                                            placeholder="Ej. OPERADORES LOGISTIX PERU S.A.C." />
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 2: Valores Aduaneros ── */}
                            {tab === 'valores' && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Datos de la factura e importes
                                    </h3>
                                    <p className="text-xs text-gray-500 -mt-2">
                                        Ingresa los montos en Dólares Americanos (USD). El sistema calculará automáticamente la Base Imponible (CIF).
                                    </p>
                                    <div className="grid grid-cols-2 gap-5">
                                        <CampoMoneda label="Valor FOB (USD) *" value={valorFob}
                                            onChange={e => setValorFob(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Flete Int. (USD) *" value={flete}
                                            onChange={e => setFlete(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Seguro (USD) *" value={seguro}
                                            onChange={e => setSeguro(e.target.value)} disabled={bloqueado} />
                                        <CampoMoneda label="Total Ajustes (USD)" value={totalAjustes}
                                            onChange={e => setTotalAjustes(e.target.value)} disabled={bloqueado} />
                                    </div>
                                    {/* CIF */}
                                    <div className="mt-2 p-4 bg-[#f0fdfa] border border-[#99f6e4] rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wider">
                                                    Base Imponible (Valor CIF) USD
                                                </p>
                                                <p className="text-xs text-[#14b8a6] mt-0.5">
                                                    Cálculo automático: CIF = FOB + Flete + Seguro
                                                </p>
                                            </div>
                                            <span className="text-3xl font-bold text-[#0f766e]">
                                                $ {valorCif}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab 3: Partidas ── */}
                            {tab === 'partidas' && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Partidas Arancelarias
                                    </h3>
                                    {!bloqueado
                                        ? <AsignarPartida idDespacho={despacho.idDespacho} />
                                        : (
                                            <div className="space-y-3">
                                                <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-3 py-2">
                                                    La DAM está finalizada. No se pueden agregar ni eliminar partidas.
                                                </p>
                                                <PartidaResumen idDespacho={despacho.idDespacho} />
                                            </div>
                                        )
                                    }
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={handleGuardarBorrador}
                                disabled={loading || bloqueado}
                                className={`flex items-center gap-2 px-5 py-2.5 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors ${
                                    loading || bloqueado ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                {loading ? 'Guardando...' : 'Guardar Borrador'}
                            </button>

                            <button
                                onClick={handleGenerarOficial}
                                disabled={loading || bloqueado || !damExistente}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#007685] transition-colors ${
                                    loading || bloqueado || !damExistente ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {bloqueado ? 'DAM Finalizada' : 'Generar Oficial'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Panel lateral derecho ── */}
                <div className="w-64 shrink-0 space-y-4">

                    {/* Estado del despacho */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado del despacho</p>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${estadoClass(bloqueado ? 'Liquidación Terminada' : despacho.estado)}`}>
                            {bloqueado ? 'Liquidación Terminada' : (despacho.estado || 'En Apertura')}
                        </span>

                        <div className="mt-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tarea actual</p>
                            <p className="text-sm font-semibold text-gray-800">
                                {bloqueado ? 'Numeración oficial' : 'Liquidación de tributos'}
                            </p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${bloqueado ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {bloqueado ? 'Finalizado' : 'En Proceso'}
                            </span>
                        </div>
                    </div>

                    {/* Flujo del despacho */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Flujo del despacho</p>
                        <div className="space-y-3">
                            {etapas.length === 0 ? (
                                <p className="text-xs text-gray-400">Cargando etapas...</p>
                            ) : (
                                etapas.map((etapa, i) => {
                                    const finalizado = etapa.estado === 'Completado' || etapa.estado === 'Finalizado';
                                    const enProceso  = etapa.estado === 'En Proceso';
                                    const pendiente  = !finalizado && !enProceso;
                                    return (
                                        <div key={etapa.idTipoEtapa} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                                    finalizado ? 'bg-[#008b9c] text-white' :
                                                    enProceso  ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' :
                                                                'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {finalizado
                                                        ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        : etapa.orden
                                                    }
                                                </div>
                                                {i < etapas.length - 1 && (
                                                    <div className={`w-0.5 h-5 mt-1 ${finalizado ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />
                                                )}
                                            </div>
                                            <div className="pt-0.5">
                                                <p className={`text-xs font-semibold leading-tight ${
                                                    enProceso  ? 'text-[#008b9c]' :
                                                    finalizado ? 'text-gray-600'  : 'text-gray-400'
                                                }`}>
                                                    {etapa.nombre}
                                                </p>
                                                {enProceso  && <span className="text-[10px] text-[#008b9c] font-medium">En Proceso</span>}
                                                {finalizado && <span className="text-[10px] text-gray-400">Finalizado</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Info del expediente */}
                    {damExistente && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Expediente DAM</p>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">ID DAM</span>
                                    <span className="font-mono font-semibold">#{damExistente.idDam}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Estado</span>
                                    <span className={`font-semibold ${bloqueado ? 'text-green-600' : 'text-blue-600'}`}>
                                        {bloqueado ? 'Finalizado' : 'Borrador'}
                                    </span>
                                </div>
                                {damExistente.fechaCreacion && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Creado</span>
                                        <span>{new Date(damExistente.fechaCreacion).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {damExistente.fechaFinalizacion && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Finalizado</span>
                                        <span>{new Date(damExistente.fechaFinalizacion).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Subcomponentes ────────────────────────────────────────────
function Campo({ label, value, onChange, disabled, placeholder }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            />
        </div>
    );
}

function CampoMoneda({ label, value, onChange, disabled }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                />
            </div>
        </div>
    );
}

function PartidaResumen({ idDespacho }) {
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch(`http://localhost:5018/api/despachos/${idDespacho}/partidas`);
                if (res.ok) setPartidas(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [idDespacho]);

    if (loading) return <p className="text-sm text-gray-400">Cargando partidas...</p>;
    if (!partidas.length) return (
        <p className="text-sm text-gray-400 py-4 text-center">No hay partidas asignadas.</p>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-3 pr-4">Partida Nacional</th>
                        <th className="pb-3 pr-4">Subpartida</th>
                        <th className="pb-3 pr-4">Bultos</th>
                        <th className="pb-3 pr-4">Peso Neto</th>
                        <th className="pb-3">Peso Bruto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {partidas.map(p => (
                        <tr key={p.idPartida}>
                            <td className="py-3 pr-4 font-mono font-semibold text-gray-800">{p.partidaNacional}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.subpartidaNaban || '—'}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.cantidadBultos}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.pesoNetoKg} kg</td>
                            <td className="py-3 text-gray-600">{p.pesoBrutoKg} kg</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}