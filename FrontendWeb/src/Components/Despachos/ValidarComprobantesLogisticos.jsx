import { useState, useEffect } from 'react';

const API_DOCS = 'http://localhost:5018/api/DocumentosLogisticos';
const API_DESP = 'http://localhost:5018/api/Despachos';
const API_ITEMS = 'http://localhost:5018/api/ItemsFactura';
const TIPO_COMP = 'Comprobante de Pago Logístico';
const TIPO_CAMBIO = 3.40;

function fmtSoles(usd) {
    return (usd * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtFecha(f) { return f ? new Date(f).toLocaleString('es-PE') : '—'; }
function fmtTamano(b) {
    if (!b) return '—';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
function esPdf(nombre) { return (nombre ?? '').toLowerCase().endsWith('.pdf'); }

export default function ValidarComprobantesLogisticos({ despacho, onVolver, usuario }) {
    const [comprobantes, setComprobantes] = useState([]);
    const [cargando, setCargando]         = useState(true);
    const [errorCarga, setErrorCarga]     = useState('');
    const [fob, setFob]                   = useState(null);

    const [visorDoc, setVisorDoc]         = useState(null);

    // por comprobante: null | 'aceptado' | 'rechazado'
    const [estados, setEstados]           = useState({});
    const [procesando, setProcesando]     = useState({});
    const [errores, setErrores]           = useState({});
    const [resultado, setResultado]       = useState(null);

    const idDespacho = despacho?.idDespacho;

    // Carga comprobantes + monto FOB en paralelo
    useEffect(() => {
        if (!idDespacho) { setCargando(false); return; }
        Promise.all([
            fetch(`${API_DOCS}/${idDespacho}`).then(r => r.ok ? r.json() : []),
            fetch(`${API_ITEMS}/${idDespacho}`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([docs, items]) => {
            setComprobantes(docs.filter(d => d.tipoDocumento === TIPO_COMP));
            const total = items.reduce((s, it) => s + Number(it.cantidad || 0) * Number(it.valor || 0), 0);
            setFob(total > 0 ? total : null);
        }).catch(() => setErrorCarga('Error al cargar los datos del despacho.')).finally(() => setCargando(false));
    }, [idDespacho]);

    // Tributos
    const adValorem  = fob ? fob * 0.06 : 0;
    const igv        = fob ? (fob + adValorem) * 0.16 : 0;
    const ipm        = fob ? (fob + adValorem) * 0.02 : 0;
    const percepcion = fob ? (fob + adValorem + igv + ipm) * 0.035 : 0;
    const totalTrib  = adValorem + igv + ipm + percepcion;

    const cambiarEstadoDespacho = async (nuevoEstado) => {
        const res = await fetch(`${API_DESP}/${idDespacho}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error('Error al actualizar estado del despacho.');
    };

    const handleAceptar = async (doc) => {
        const id = doc.idDocumentoLogistico;
        setProcesando(p => ({ ...p, [id]: true }));
        setErrores(e => ({ ...e, [id]: '' }));
        try {
            await cambiarEstadoDespacho('Tributos Cancelados');
            setEstados(s => ({ ...s, [id]: 'aceptado' }));
            setResultado({
                tipo: 'aceptado',
                nombre: doc.nombreArchivo,
                usuario: usuario?.nombreCompleto ?? 'Administrador',
                fecha: new Date().toLocaleString('es-PE'),
            });
        } catch {
            setErrores(e => ({ ...e, [id]: 'Error al aprobar. Intenta nuevamente.' }));
        } finally {
            setProcesando(p => ({ ...p, [id]: false }));
        }
    };

    const handleRechazar = async (doc) => {
        const id = doc.idDocumentoLogistico;
        if (!window.confirm('¿Confirmas el rechazo? El despacho regresará a "Pendiente de Pago".')) return;
        setProcesando(p => ({ ...p, [id]: true }));
        setErrores(e => ({ ...e, [id]: '' }));
        try {
            // Marcar documento como Observado en BD
            const resDoc = await fetch(`${API_DOCS}/${id}/revisar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Observado', observacion: 'Comprobante rechazado por el administrador.' }),
            });
            if (!resDoc.ok) throw new Error('Error al marcar documento como Observado.');

            await cambiarEstadoDespacho('Pendiente de Pago');
            setEstados(s => ({ ...s, [id]: 'rechazado' }));
            setResultado({
                tipo: 'rechazado',
                nombre: doc.nombreArchivo,
                usuario: usuario?.nombreCompleto ?? 'Administrador',
                fecha: new Date().toLocaleString('es-PE'),
            });
        } catch {
            setErrores(e => ({ ...e, [id]: 'Error al rechazar. Intenta nuevamente.' }));
        } finally {
            setProcesando(p => ({ ...p, [id]: false }));
        }
    };

    // ── Pantalla de resultado final ──
    if (resultado) {
        const aprobado = resultado.tipo === 'aceptado';
        return (
            <div className="max-w-2xl mx-auto">
                <div className={`border rounded-xl p-6 flex items-start gap-4 mb-6 ${aprobado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${aprobado ? 'bg-green-100' : 'bg-red-100'}`}>
                        <svg className={`w-6 h-6 ${aprobado ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {aprobado
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />}
                        </svg>
                    </div>
                    <div>
                        <p className={`text-base font-bold ${aprobado ? 'text-green-800' : 'text-red-800'}`}>
                            Comprobante {aprobado ? 'aceptado' : 'rechazado'}
                        </p>
                        <p className={`text-sm mt-0.5 ${aprobado ? 'text-green-600' : 'text-red-600'}`}>
                            {aprobado
                                ? `El despacho cambió a "Tributos Cancelados". Se habilitó la etapa de numeración aduanera.`
                                : `El despacho regresó a "Pendiente de Pago". El cliente debe subir el comprobante correcto.`}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            <span className="font-semibold">{resultado.nombre}</span> · Revisado por <span className="font-semibold">{resultado.usuario}</span> · {resultado.fecha}
                        </p>
                        {resultado.motivo && (
                            <p className="text-xs text-gray-500 mt-1">Motivo: {resultado.motivo}</p>
                        )}
                    </div>
                </div>
                <button onClick={onVolver} className="px-6 py-2.5 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                    Volver
                </button>
            </div>
        );
    }

    return (
        <>
            {/* ── Modal visor ── */}
            {visorDoc && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setVisorDoc(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                            <div>
                                <p className="text-sm font-semibold text-gray-800 truncate">{visorDoc.nombreArchivo}</p>
                                <p className="text-xs text-gray-400">Solo lectura · {fmtTamano(visorDoc.tamanoBytes)} · Subido el {fmtFecha(visorDoc.fechaCarga)}</p>
                            </div>
                            <button onClick={() => setVisorDoc(null)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-4 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-3 min-h-0">
                            {esPdf(visorDoc.nombreArchivo) ? (
                                <iframe title={visorDoc.nombreArchivo} src={`${API_DOCS}/${visorDoc.idDocumentoLogistico}/archivo`}
                                    className="w-full rounded-lg border border-gray-100" style={{ height: '70vh' }} />
                            ) : (
                                <img alt={visorDoc.nombreArchivo} src={`${API_DOCS}/${visorDoc.idDocumentoLogistico}/archivo`}
                                    className="max-w-full mx-auto rounded-lg object-contain" style={{ maxHeight: '70vh' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    ← Volver
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Validar Comprobantes de Pago</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                    &nbsp;· Revisor: <span className="font-semibold">{usuario?.nombreCompleto ?? 'Administrador'}</span>
                </p>

                {cargando && (
                    <div className="flex items-center justify-center gap-2 py-20 text-gray-400 text-sm">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Cargando comprobantes...
                    </div>
                )}

                {errorCarga && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">{errorCarga}</div>
                )}

                {!cargando && !errorCarga && (
                    <div className="flex gap-6 items-start">

                        {/* ── Columna principal: comprobantes ── */}
                        <div className="flex-1 min-w-0">
                            {comprobantes.length === 0 ? (
                                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                                    No hay comprobantes logísticos adjuntos para este despacho.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {comprobantes.map(doc => {
                                        const id      = doc.idDocumentoLogistico;
                                        const estado  = estados[id];
                                        const ocupado = procesando[id];
                                        const error   = errores[id];

                                        return (
                                            <div key={id} className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                                                estado === 'aceptado' ? 'border-green-300' :
                                                estado === 'rechazado' ? 'border-red-300' : 'border-gray-200'
                                            }`}>
                                                {/* Cabecera del comprobante */}
                                                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                                                    <svg className="w-8 h-8 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{doc.nombreArchivo}</p>
                                                        <p className="text-xs text-gray-400">{fmtTamano(doc.tamanoBytes)} · Subido el {fmtFecha(doc.fechaCarga)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {estado === 'aceptado' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                                                Aceptado
                                                            </span>
                                                        )}
                                                        {estado === 'rechazado' && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                                                                Rechazado
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => setVisorDoc(visorDoc?.idDocumentoLogistico === id ? null : doc)}
                                                            title="Previsualizar"
                                                            className={`p-2 rounded-lg transition-colors ${visorDoc?.idDocumentoLogistico === id ? 'bg-[#008b9c] text-white' : 'text-[#008b9c] hover:bg-[#e0f7fa]'}`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Acciones — solo si aún no se decidió */}
                                                {!estado && (
                                                    <div className="px-5 py-4 space-y-3">
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleAceptar(doc)}
                                                                disabled={ocupado}
                                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                                                    ocupado ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                                                                }`}
                                                            >
                                                                {ocupado ? (
                                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                                    </svg>
                                                                )}
                                                                ACEPTAR COMPROBANTE
                                                            </button>
                                                            <button
                                                                onClick={() => handleRechazar(doc)}
                                                                disabled={ocupado}
                                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                                                    ocupado ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                                                                }`}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                                </svg>
                                                                RECHAZAR
                                                            </button>
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── Panel lateral: monto tributario ── */}
                        <div className="w-64 shrink-0">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-3 bg-[#1a2540]">
                                    <p className="text-xs font-bold text-white uppercase tracking-wide">Monto a Validar</p>
                                    <p className="text-xs text-blue-200 mt-0.5">Tributos del despacho · S/ {TIPO_CAMBIO}</p>
                                </div>
                                {fob === null ? (
                                    <div className="px-5 py-4 text-xs text-gray-400">Sin datos tributarios para este despacho.</div>
                                ) : (
                                    <>
                                        <ul className="divide-y divide-gray-50 text-sm">
                                            <li className="flex justify-between px-5 py-2.5">
                                                <span className="text-gray-500">Ad Valorem <span className="text-[#008b9c] font-semibold">6%</span></span>
                                                <span className="font-semibold text-gray-700">S/ {fmtSoles(adValorem)}</span>
                                            </li>
                                            <li className="flex justify-between px-5 py-2.5">
                                                <span className="text-gray-500">IGV <span className="text-[#008b9c] font-semibold">16%</span></span>
                                                <span className="font-semibold text-gray-700">S/ {fmtSoles(igv)}</span>
                                            </li>
                                            <li className="flex justify-between px-5 py-2.5">
                                                <span className="text-gray-500">IPM 2%</span>
                                                <span className="font-semibold text-gray-700">S/ {fmtSoles(ipm)}</span>
                                            </li>
                                            <li className="flex justify-between px-5 py-2.5">
                                                <span className="text-gray-500">Percepción 3.5%</span>
                                                <span className="font-semibold text-gray-700">S/ {fmtSoles(percepcion)}</span>
                                            </li>
                                        </ul>
                                        <div className="flex justify-between items-center px-5 py-3 bg-[#f0fbfc] border-t border-[#b2ebf2]">
                                            <span className="text-sm font-bold text-[#1a2540]">Total</span>
                                            <span className="text-base font-bold text-[#1a2540]">S/ {fmtSoles(totalTrib)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
