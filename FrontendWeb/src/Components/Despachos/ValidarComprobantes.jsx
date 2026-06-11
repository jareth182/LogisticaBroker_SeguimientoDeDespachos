import { useState, useEffect } from 'react';

const API_DOCS  = 'http://localhost:5018/api/DocumentosLogisticos';
const API_DESP  = 'http://localhost:5018/api/Despachos';
const TIPO_COMP = 'Comprobante de Pago Logístico';

export default function ValidarComprobantes({ despacho, onVolver, usuario }) {
    const [comprobantes, setComprobantes]   = useState([]);
    const [cargando, setCargando]           = useState(true);
    const [errorCarga, setErrorCarga]       = useState('');

    const [previewDoc, setPreviewDoc]       = useState(null);

    const [revisados, setRevisados]         = useState([]);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando]       = useState(false);
    const [resultado, setResultado]         = useState(null);
    const [errorAprobar, setErrorAprobar]   = useState('');
    const [errorRechazar, setErrorRechazar] = useState('');

    const idDespacho = despacho?.idDespacho;

    useEffect(() => {
        if (!idDespacho) { setCargando(false); return; }
        fetch(`${API_DOCS}/${idDespacho}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setComprobantes(data.filter(d => d.tipoDocumento === TIPO_COMP)))
            .catch(() => setErrorCarga('No se pudieron cargar los comprobantes. Intenta nuevamente.'))
            .finally(() => setCargando(false));
    }, [idDespacho]);

    const todosRevisados = comprobantes.length > 0 && revisados.length >= comprobantes.length;
    const pendientes     = comprobantes.length - revisados.length;

    const handlePrevisualizar = (doc) => {
        setPreviewDoc(prev => prev?.idDocumentoLogistico === doc.idDocumentoLogistico ? null : doc);
        setRevisados(prev => prev.includes(doc.idDocumentoLogistico) ? prev : [...prev, doc.idDocumentoLogistico]);
    };

    const cambiarEstadoDespacho = async (nuevoEstado) => {
        const res = await fetch(`${API_DESP}/${idDespacho}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (!res.ok) throw new Error('Error al actualizar el estado del despacho.');
    };

    const ahora = () => new Date().toLocaleString('es-PE');

    // CA2: aprobar → "Tributos Cancelados" + auditoría
    const handleAprobar = async () => {
        if (procesando || !todosRevisados) return;
        setProcesando(true);
        setErrorAprobar('');
        try {
            await cambiarEstadoDespacho('Tributos Cancelados');
            setResultado({
                tipo: 'aprobado',
                mensaje: 'El estado del despacho cambió a "Tributos Cancelados". Se habilitó la etapa de numeración aduanera.',
                usuario: usuario?.nombreCompleto ?? 'Administrador',
                fecha: ahora(),
            });
        } catch {
            setErrorAprobar('Error al aprobar el comprobante. Intenta nuevamente.');
        } finally {
            setProcesando(false);
        }
    };

    // CA3: rechazar → "Pendiente de Pago" + notificación + auditoría
    const handleRechazar = async () => {
        if (!motivoRechazo.trim() || procesando || !todosRevisados) return;
        if (!window.confirm('¿Confirmas el rechazo del comprobante por inconsistencias? El despacho regresará a "Pendiente de Pago".')) return;
        setProcesando(true);
        setErrorRechazar('');
        try {
            await cambiarEstadoDespacho('Pendiente de Pago');
            setResultado({
                tipo: 'rechazado',
                mensaje: 'El cliente fue notificado para que adjunte el documento correcto. El estado regresó a "Pendiente de Pago".',
                usuario: usuario?.nombreCompleto ?? 'Administrador',
                fecha: ahora(),
                motivo: motivoRechazo,
            });
        } catch {
            setErrorRechazar('Error al registrar el rechazo. Intenta nuevamente.');
        } finally {
            setProcesando(false);
        }
    };

    const fmtFecha = (f) => f ? new Date(f).toLocaleString('es-PE') : '—';
    const fmtTamano = (b) => {
        if (!b) return '—';
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
        return `${(b / 1024 / 1024).toFixed(2)} MB`;
    };
    const esPdf = (nombre) => (nombre ?? '').toLowerCase().endsWith('.pdf');

    // ── Resultado final (aprobado / rechazado) ──
    if (resultado) {
        const aprobado = resultado.tipo === 'aprobado';
        return (
            <div className="max-w-3xl mx-auto">
                <div className={`border rounded-xl p-6 flex items-start gap-4 ${aprobado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${aprobado ? 'bg-green-100' : 'bg-red-100'}`}>
                        <svg className={`w-6 h-6 ${aprobado ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {aprobado
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />}
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className={`text-base font-bold ${aprobado ? 'text-green-800' : 'text-red-800'}`}>
                            {aprobado ? 'Comprobante aprobado' : 'Comprobante rechazado'}
                        </p>
                        <p className={`text-sm mt-0.5 ${aprobado ? 'text-green-600' : 'text-red-600'}`}>{resultado.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Registrado por: <span className="font-semibold">{resultado.usuario}</span> · {resultado.fecha}
                        </p>
                        {resultado.motivo && (
                            <p className="text-xs text-gray-500 mt-1">Motivo: {resultado.motivo}</p>
                        )}
                    </div>
                </div>
                <button onClick={onVolver} className="mt-6 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Volver
                </button>
            </div>
        );
    }

    // ── Estado "Pago en Verificación" requerido ──
    if (!cargando && despacho?.estado !== 'Pago en Verificación') {
        return (
            <div className="max-w-3xl mx-auto">
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    ← Volver
                </button>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    Este despacho no tiene comprobantes pendientes de validación. Estado actual: <span className="font-semibold">{despacho?.estado ?? '—'}</span>.
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ── Modal visor de documento ── */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                            <div>
                                <p className="text-sm font-semibold text-gray-800 truncate">{previewDoc.nombreArchivo}</p>
                                <p className="text-xs text-gray-400">Solo lectura · {fmtTamano(previewDoc.tamanoBytes)} · Subido el {fmtFecha(previewDoc.fechaCarga)}</p>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-4 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-3 min-h-0">
                            {esPdf(previewDoc.nombreArchivo) ? (
                                <iframe
                                    title={previewDoc.nombreArchivo}
                                    src={`${API_DOCS}/${previewDoc.idDocumentoLogistico}/archivo`}
                                    className="w-full rounded-lg border border-gray-100"
                                    style={{ height: '70vh' }}
                                />
                            ) : (
                                <img
                                    alt={previewDoc.nombreArchivo}
                                    src={`${API_DOCS}/${previewDoc.idDocumentoLogistico}/archivo`}
                                    className="max-w-full mx-auto rounded-lg object-contain"
                                    style={{ maxHeight: '70vh' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    ← Volver
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Validar Comprobante de Pago</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                    &nbsp;· Revisado por: <span className="font-semibold">{usuario?.nombreCompleto ?? 'Administrador'}</span>
                </p>

                {/* Cargando */}
                {cargando && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-10 justify-center">
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
                    <>
                        {/* Banner de progreso de revisión */}
                        <div className={`p-3 rounded-lg text-sm font-semibold mb-4 border ${
                            todosRevisados
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}>
                            {comprobantes.length === 0
                                ? 'No hay comprobantes adjuntos para este despacho.'
                                : todosRevisados
                                    ? 'Todos los comprobantes fueron revisados. Puedes aprobar o rechazar.'
                                    : `Pendientes de revisar: ${pendientes} de ${comprobantes.length}. Previsualiza todos antes de decidir.`}
                        </div>

                        {/* Lista de comprobantes */}
                        {comprobantes.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                                <div className="px-5 py-3 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-700">Comprobantes adjuntos ({comprobantes.length})</p>
                                </div>
                                <ul className="divide-y divide-gray-50">
                                    {comprobantes.map(doc => {
                                        const revisado  = revisados.includes(doc.idDocumentoLogistico);
                                        const activo    = previewDoc?.idDocumentoLogistico === doc.idDocumentoLogistico;
                                        return (
                                            <li key={doc.idDocumentoLogistico} className="px-5 py-3 flex items-center gap-3">
                                                <svg className="w-8 h-8 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.nombreArchivo}</p>
                                                    <p className="text-xs text-gray-500">{fmtTamano(doc.tamanoBytes)} · Subido el {fmtFecha(doc.fechaCarga)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {revisado && (
                                                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Revisado</span>
                                                    )}
                                                    <button
                                                        onClick={() => handlePrevisualizar(doc)}
                                                        title="Previsualizar"
                                                        className={`p-2 rounded-lg transition-colors ${activo ? 'bg-[#008b9c] text-white' : 'text-[#008b9c] hover:bg-[#e0f7fa]'}`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* CA2: Aprobar */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
                            <p className="text-sm font-bold text-gray-700 mb-1">Aprobar comprobante</p>
                            <p className="text-xs text-gray-400 mb-3">El despacho pasará a "Tributos Cancelados" y se habilitará la etapa de numeración aduanera.</p>
                            {errorAprobar && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">{errorAprobar}</div>
                            )}
                            <button
                                onClick={handleAprobar}
                                disabled={procesando || !todosRevisados}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                    procesando || !todosRevisados
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                                }`}
                            >
                                {procesando ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        APROBAR COMPROBANTE
                                    </>
                                )}
                            </button>
                        </div>

                        {/* CA3: Rechazar */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <p className="text-sm font-bold text-gray-700 mb-1">Rechazar comprobante</p>
                            <p className="text-xs text-gray-400 mb-3">El despacho volverá a "Pendiente de Pago" y el cliente recibirá una notificación.</p>
                            <textarea
                                value={motivoRechazo}
                                onChange={e => setMotivoRechazo(e.target.value.slice(0, 500))}
                                placeholder="Ingrese el motivo del rechazo (obligatorio)..."
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-1"
                            />
                            <p className="text-xs text-gray-400 text-right mb-3">{motivoRechazo.length}/500</p>
                            {errorRechazar && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">{errorRechazar}</div>
                            )}
                            <button
                                onClick={handleRechazar}
                                disabled={!motivoRechazo.trim() || procesando || !todosRevisados}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                    !motivoRechazo.trim() || procesando || !todosRevisados
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                RECHAZAR POR INCONSISTENCIAS
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
