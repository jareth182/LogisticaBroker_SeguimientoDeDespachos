import { useState, useEffect, useCallback } from 'react';
import AsignarPartida from '../Despachos/AsignarPartida';

const API_DESPACHOS = 'http://localhost:5018/api/Despachos';
const API_DAM       = 'http://localhost:5018/api/DAM';

export default function GenerarBorradorDAM() {
    // ── Estado de selección de despacho ───────────────────────
    const [despachos, setDespachos]           = useState([]);
    const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
    const [loadingDespachos, setLoadingDespachos] = useState(false);

    // ── Estado del formulario DAM ─────────────────────────────
    const [tab, setTab]                       = useState('generales');
    const [damExistente, setDamExistente]     = useState(null);
    const [bloqueado, setBloqueado]           = useState(false);

    // Pestaña 1: Datos Generales
    const [importadorExportador, setImportadorExportador] = useState('');
    const [codDocIdentificacion, setCodDocIdentificacion] = useState('');
    const [direccionImportador, setDireccionImportador]   = useState('');
    const [empresaTransporte, setEmpresaTransporte]       = useState('');
    const [viaTransporte, setViaTransporte]               = useState('Marítimo');
    const [puertoEmbarque, setPuertoEmbarque]             = useState('');
    const [terminalAlmacenamiento, setTerminalAlmacenamiento] = useState('');

    // Pestaña 2: Valores Aduaneros — HU11 criterio 2
    const [valorFob, setValorFob]       = useState('');
    const [flete, setFlete]             = useState('');
    const [seguro, setSeguro]           = useState('');
    const [totalAjustes, setTotalAjustes] = useState('');

    // ── UI ────────────────────────────────────────────────────
    const [loading, setLoading]         = useState(false);
    const [mensaje, setMensaje]         = useState(null);
    const [autoguardado, setAutoguardado] = useState(null);

    // ── CIF calculado automáticamente — HU11 criterio 2 ──────
    const valorCif = (
        (parseFloat(valorFob) || 0) +
        (parseFloat(flete) || 0) +
        (parseFloat(seguro) || 0) +
        (parseFloat(totalAjustes) || 0)
    ).toFixed(2);

    // ── Cargar lista de despachos al montar ───────────────────
    useEffect(() => {
        const cargar = async () => {
            setLoadingDespachos(true);
            try {
                const res = await fetch(API_DESPACHOS);
                if (res.ok) setDespachos(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingDespachos(false);
            }
        };
        cargar();
    }, []);

    // ── Al seleccionar despacho, cargar DAM si ya existe ──────
    const seleccionarDespacho = async (d) => {
        setDespachoSeleccionado(d);
        setMensaje(null);
        setTab('generales');
        try {
            const res = await fetch(`${API_DAM}/${d.idDespacho}/borrador`);
            if (res.ok) {
                const dam = await res.json();
                setDamExistente(dam);
                setBloqueado(dam.edicionBloqueada);
                // HU11 criterio 1: autocompletar
                setImportadorExportador(dam.importadorExportador || d.razonSocial || '');
                setCodDocIdentificacion(dam.codDocIdentificacion || d.ruc || '');
                setDireccionImportador(dam.direccionImportador || '');
                setEmpresaTransporte(dam.empresaTransporte || '');
                setViaTransporte(dam.viaTransporte || 'Marítimo');
                setPuertoEmbarque(dam.puertoEmbarque || '');
                setTerminalAlmacenamiento(dam.terminalAlmacenamiento || '');
                setValorFob(dam.valorFob || '');
                setFlete(dam.flete || '');
                setSeguro(dam.seguro || '');
                setTotalAjustes(dam.totalAjustes || '');
            } else {
                // No existe DAM — autocompletar con datos del despacho
                setDamExistente(null);
                setBloqueado(false);
                setImportadorExportador(d.razonSocial || '');
                setCodDocIdentificacion(d.ruc || '');
                setDireccionImportador('');
                setEmpresaTransporte('');
                setViaTransporte('Marítimo');
                setPuertoEmbarque(d.origen || '');
                setTerminalAlmacenamiento('');
                setValorFob('');
                setFlete('');
                setSeguro('');
                setTotalAjustes('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ── Autoguardado en localStorage — HU11 req. no funcional ─
    const guardarLocal = useCallback(() => {
        if (!despachoSeleccionado) return;
        const datos = {
            importadorExportador, codDocIdentificacion, direccionImportador,
            empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
            valorFob, flete, seguro, totalAjustes
        };
        localStorage.setItem(`dam_borrador_${despachoSeleccionado.idDespacho}`, JSON.stringify(datos));
        setAutoguardado(new Date().toLocaleTimeString());
    }, [importadorExportador, codDocIdentificacion, direccionImportador,
        empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
        valorFob, flete, seguro, totalAjustes, despachoSeleccionado]);

    useEffect(() => {
        if (!despachoSeleccionado || bloqueado) return;
        const timer = setTimeout(guardarLocal, 2000);
        return () => clearTimeout(timer);
    }, [guardarLocal, despachoSeleccionado, bloqueado]);

    // ── Guardar Borrador — HU11 criterio 3 ───────────────────
    const handleGuardarBorrador = async () => {
        if (!despachoSeleccionado) return;
        setLoading(true);
        setMensaje(null);

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const body = {
            idDespacho: despachoSeleccionado.idDespacho,
            idUsuarioCreador: usuario.idUsuario || 2,
            importadorExportador, codDocIdentificacion, direccionImportador,
            empresaTransporte, viaTransporte, puertoEmbarque, terminalAlmacenamiento,
            valorFob: parseFloat(valorFob) || 0,
            flete: parseFloat(flete) || 0,
            seguro: parseFloat(seguro) || 0,
            totalAjustes: parseFloat(totalAjustes) || 0
        };

        try {
            let res;
            if (damExistente) {
                // DAM ya existe → actualizar con PUT
                res = await fetch(`${API_DAM}/${despachoSeleccionado.idDespacho}/borrador`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } else {
                // Primera vez → crear con POST
                res = await fetch(`${API_DAM}/generar-borrador`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            }

            const data = await res.json();
            if (res.ok) {
                setDamExistente(data);
                setMensaje({ tipo: 'exito', texto: '¡Borrador guardado exitosamente! El expediente permanece editable.' });
                localStorage.removeItem(`dam_borrador_${despachoSeleccionado.idDespacho}`);
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al guardar el borrador.' });
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Generar Oficial — HU11 criterio 4 ────────────────────
    const handleGenerarOficial = async () => {
        if (!despachoSeleccionado || !damExistente) {
            setMensaje({ tipo: 'error', texto: 'Primero guarda el borrador antes de generar el oficial.' });
            return;
        }
        if (!window.confirm('¿Estás seguro? El formulario se bloqueará y el despacho avanzará a "Liquidación Terminada".')) return;

        setLoading(true);
        setMensaje(null);
        try {
            const res = await fetch(`${API_DAM}/${despachoSeleccionado.idDespacho}/finalizar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                setBloqueado(true);
                setMensaje({ tipo: 'exito', texto: '¡DAM Oficial generada! El formulario ha sido bloqueado y el despacho avanzó a "Liquidación Terminada".' });
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al finalizar la DAM.' });
            }
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Si no hay despacho seleccionado mostrar lista ─────────
    if (!despachoSeleccionado) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Generar Borrador DAM</h2>
                <p className="text-gray-500 text-sm mb-6">Selecciona el despacho para generar o continuar editando su DAM.</p>

                {loadingDespachos ? (
                    <p className="text-sm text-gray-400 text-center py-10">Cargando despachos...</p>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Código</th>
                                    <th className="px-6 py-4">Importador</th>
                                    <th className="px-6 py-4">BL</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {despachos.map(d => (
                                    <tr key={d.idDespacho} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">{d.codigoOrden}</td>
                                        <td className="px-6 py-4 text-gray-600">{d.razonSocial}</td>
                                        <td className="px-6 py-4 font-mono text-gray-600">{d.codigoBl}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                {d.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => seleccionarDespacho(d)}
                                                className="px-4 py-1.5 bg-[#00b4d8] text-white text-xs font-semibold rounded-lg hover:bg-[#009bc2] transition-colors"
                                            >
                                                Generar DAM
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // ── Formulario DAM ────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto mt-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setDespachoSeleccionado(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">
                            Generar Borrador de DAM
                        </h2>
                        {bloqueado && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                LIQUIDACIÓN TERMINADA
                            </span>
                        )}
                        {!bloqueado && damExistente && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                BORRADOR EN PROGRESO
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                        {despachoSeleccionado.codigoOrden} — {despachoSeleccionado.razonSocial} | BL: {despachoSeleccionado.codigoBl}
                    </p>
                </div>
                {autoguardado && !bloqueado && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Autoguardado {autoguardado}
                    </div>
                )}
            </div>

            {/* Mensaje */}
            {mensaje && (
                <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${
                    mensaje.tipo === 'exito'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Card principal */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6 pt-4">
                    <div className="flex gap-6">
                        {[
                            { id: 'generales', label: 'Datos Generales' },
                            { id: 'valores',   label: 'Valores Aduaneros' },
                            { id: 'partidas',  label: 'Partidas Arancelarias' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                                    tab === t.id
                                        ? 'border-[#00b4d8] text-[#00b4d8]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">

                    {/* ── Pestaña 1: Datos Generales ── */}
                    {tab === 'generales' && (
                        <div className="space-y-5">
                            <h3 className="text-base font-semibold text-gray-700">Información General</h3>
                            {bloqueado && (
                                <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                                    Este formulario ha sido bloqueado tras la generación oficial.
                                </p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Campo label="Empresa de Transporte" value={empresaTransporte}
                                    onChange={e => setEmpresaTransporte(e.target.value)} disabled={bloqueado}
                                    placeholder="Ej. TERMINALES PORTUARIOS PERUANOS SAC" />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vía de Transporte</label>
                                    <select
                                        value={viaTransporte}
                                        onChange={e => setViaTransporte(e.target.value)}
                                        disabled={bloqueado}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option>Marítimo</option>
                                        <option>Aéreo</option>
                                        <option>Terrestre</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Campo label="Puerto de Embarque" value={puertoEmbarque}
                                    onChange={e => setPuertoEmbarque(e.target.value)} disabled={bloqueado}
                                    placeholder="Ej. YANTIAN" />
                                <Campo label="Terminal de Almacenamiento" value={terminalAlmacenamiento}
                                    onChange={e => setTerminalAlmacenamiento(e.target.value)} disabled={bloqueado}
                                    placeholder="Ej. OPERADORES LOGISTIX PERU S.A.C." />
                            </div>
                        </div>
                    )}

                    {/* ── Pestaña 2: Valores Aduaneros — HU11 criterio 2 ── */}
                    {tab === 'valores' && (
                        <div className="space-y-5">
                            <h3 className="text-base font-semibold text-gray-700">Valores de la Declaración</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <CampoMoneda label="Valor FOB ($)" value={valorFob}
                                    onChange={e => setValorFob(e.target.value)} disabled={bloqueado} />
                                <CampoMoneda label="Flete ($)" value={flete}
                                    onChange={e => setFlete(e.target.value)} disabled={bloqueado} />
                                <CampoMoneda label="Seguro ($)" value={seguro}
                                    onChange={e => setSeguro(e.target.value)} disabled={bloqueado} />
                                <CampoMoneda label="Total Ajustes ($)" value={totalAjustes}
                                    onChange={e => setTotalAjustes(e.target.value)} disabled={bloqueado} />
                            </div>
                            {/* CIF calculado automáticamente */}
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Valor CIF Total / Valor Aduana
                                </label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span className="text-gray-500 font-medium">$</span>
                                    <span className="text-2xl font-bold text-gray-800">{valorCif}</span>
                                    <span className="ml-auto text-xs text-gray-400 uppercase tracking-wider">Cálculo automático</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Pestaña 3: Partidas Arancelarias ── */}
                    {tab === 'partidas' && (
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-gray-700">Resumen de Partidas</h3>
                            <p className="text-sm text-gray-500">
                                Gestiona las partidas arancelarias de este despacho y revisa el resumen
                                consolidado.
                            </p>
                            {despachoSeleccionado && !bloqueado && (
                                <AsignarPartida idDespacho={despachoSeleccionado.idDespacho} />
                            )}
                            {despachoSeleccionado && bloqueado && (
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                                        La DAM esta finalizada. No se pueden agregar ni eliminar partidas.
                                    </p>
                                    <PartidaResumen idDespacho={despachoSeleccionado.idDespacho} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Botones inferiores */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handleGuardarBorrador}
                        disabled={loading || bloqueado}
                        className={`flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors ${
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
                        className={`flex items-center gap-2 px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 ${
                            loading || bloqueado || !damExistente ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {bloqueado ? 'DAM Finalizada' : 'Generar Borrador Oficial'}
                    </button>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
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
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
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
    if (partidas.length === 0) return (
        <p className="text-sm text-gray-400 py-4 text-center">
            No hay partidas asignadas aún para este despacho.
        </p>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                        <th className="pb-3 pr-4">Partida Nacional</th>
                        <th className="pb-3 pr-4">Subpartida</th>
                        <th className="pb-3 pr-4">Bultos</th>
                        <th className="pb-3 pr-4">Peso Neto (kg)</th>
                        <th className="pb-3">Peso Bruto (kg)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {partidas.map(p => (
                        <tr key={p.idPartida}>
                            <td className="py-3 pr-4 font-mono font-semibold text-gray-800">{p.partidaNacional}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.subpartidaNaban || '—'}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.cantidadBultos}</td>
                            <td className="py-3 pr-4 text-gray-600">{p.pesoNetoKg}</td>
                            <td className="py-3 text-gray-600">{p.pesoBrutoKg}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}