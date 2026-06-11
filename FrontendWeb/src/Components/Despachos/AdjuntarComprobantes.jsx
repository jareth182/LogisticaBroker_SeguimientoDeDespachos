import { useState, useRef, useEffect } from 'react';

const FORMATOS_VALIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES_VALIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_BYTES = 10 * 1024 * 1024;
const API_ITEMS = 'http://localhost:5018/api/ItemsFactura';
const API_DOCS  = 'http://localhost:5018/api/DocumentosLogisticos';
const API_DESP  = 'http://localhost:5018/api/Despachos';
const TIPO_DOC  = 'Comprobante de Pago';
const TIPO_CAMBIO = 3.40;

function fmtTamano(b) {
    if (!b) return '—';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
function fmtFecha(f) { return f ? new Date(f).toLocaleString('es-PE') : '—'; }
function esPdf(nombre) { return (nombre ?? '').toLowerCase().endsWith('.pdf'); }

export default function AdjuntarComprobantes({ despacho, onVolver }) {
    const [archivos, setArchivos]       = useState([]);
    const [errorArchivo, setErrorArchivo] = useState('');
    const [procesando, setProcesando]   = useState(false);
    const [procesado, setProcesado]     = useState(false);
    const [errorProcesar, setErrorProcesar] = useState('');
    const [dragging, setDragging]       = useState(false);
    const inputRef = useRef(null);

    const [fob, setFob]                 = useState(null);
    const [docsGuardados, setDocsGuardados] = useState([]);
    const [cargandoDocs, setCargandoDocs]   = useState(true);
    const [visorDoc, setVisorDoc]       = useState(null);

    const idDespacho = despacho?.idDespacho;

    // Carga docs + FOB en paralelo
    useEffect(() => {
        if (!idDespacho) { setCargandoDocs(false); return; }
        Promise.all([
            fetch(`${API_DOCS}/${idDespacho}`).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_ITEMS}/${idDespacho}`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([docs, items]) => {
            setDocsGuardados(docs.filter(d => d.tipoDocumento === TIPO_DOC));
            const total = items.reduce((s, it) => s + Number(it.cantidad || 0) * Number(it.valor || 0), 0);
            setFob(total > 0 ? total : null);
        }).finally(() => setCargandoDocs(false));
    }, [idDespacho]);

    const adValorem  = fob ? fob * 0.06 : 0;
    const igv        = fob ? (fob + adValorem) * 0.16 : 0;
    const ipm        = fob ? (fob + adValorem) * 0.02 : 0;
    const percepcion = fob ? (fob + adValorem + igv + ipm) * 0.035 : 0;
    const totalTrib  = adValorem + igv + ipm + percepcion;
    const fmtSoles   = (usd) => (usd * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const validarArchivo = (f) => {
        if (!FORMATOS_VALIDOS.includes(f.type)) {
            setErrorArchivo('El formato del archivo no es válido. Solo se aceptan PDF, JPG y PNG');
            return false;
        }
        if (f.size > MAX_BYTES) {
            setErrorArchivo('El archivo supera el tamaño máximo permitido de 10 MB');
            return false;
        }
        setErrorArchivo('');
        return true;
    };

    const agregarArchivos = (lista) => {
        const nuevos = Array.from(lista);
        const validos = [];
        for (const f of nuevos) {
            if (!validarArchivo(f)) return;
            validos.push(f);
        }
        setArchivos(prev => [...prev, ...validos]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        agregarArchivos(e.dataTransfer.files);
    };

    const handleChange = (e) => {
        agregarArchivos(e.target.files);
        e.target.value = '';
    };

    const puedeProcessar = archivos.length > 0 && !errorArchivo;

    const handleProcesar = async () => {
        if (!puedeProcessar || procesando) return;
        setProcesando(true);
        setErrorProcesar('');
        try {
            for (const archivo of archivos) {
                const form = new FormData();
                form.append('TipoDocumento', TIPO_DOC);
                form.append('Archivo', archivo);
                const res = await fetch(`${API_DOCS}/${idDespacho}/subir`, { method: 'POST', body: form });
                if (!res.ok) throw new Error('Error al subir archivo.');
            }
            // Cambiar estado del despacho a "Pago en Verificación"
            await fetch(`${API_DESP}/${idDespacho}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Pago en Verificación' }),
            });
            setProcesado(true);
        } catch {
            setErrorProcesar('Error al enviar los comprobantes. Intenta nuevamente.');
        } finally {
            setProcesando(false);
        }
    };

    // ── Visor modal ──
    const modalVisor = visorDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setVisorDoc(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                    <div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{visorDoc.nombreArchivo}</p>
                        <p className="text-xs text-gray-400">{fmtTamano(visorDoc.tamanoBytes)} · Subido el {fmtFecha(visorDoc.fechaCarga)}</p>
                    </div>
                    <button onClick={() => setVisorDoc(null)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-4 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-3 min-h-0">
                    {esPdf(visorDoc.nombreArchivo) ? (
                        <iframe title={visorDoc.nombreArchivo}
                            src={`${API_DOCS}/${visorDoc.idDocumentoLogistico}/archivo`}
                            className="w-full rounded-lg border border-gray-100" style={{ height: '70vh' }} />
                    ) : (
                        <img alt={visorDoc.nombreArchivo}
                            src={`${API_DOCS}/${visorDoc.idDocumentoLogistico}/archivo`}
                            className="max-w-full mx-auto rounded-lg object-contain" style={{ maxHeight: '70vh' }} />
                    )}
                </div>
            </div>
        </div>
    );

    // ── Panel tributario lateral ──
    const panelTributario = (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#1a2540]">
                <p className="text-xs font-bold text-white uppercase tracking-wide">Monto a Pagar</p>
                <p className="text-xs text-blue-200 mt-0.5">Tributos calculados · Tipo de cambio S/ {TIPO_CAMBIO}</p>
            </div>
            {fob === null ? (
                <div className="px-5 py-4 text-xs text-gray-400">
                    Sin datos tributarios disponibles para este despacho.
                </div>
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
                        <span className="text-sm font-bold text-[#1a2540]">Total a Pagar</span>
                        <span className="text-base font-bold text-[#1a2540]">S/ {fmtSoles(totalTrib)}</span>
                    </div>
                </>
            )}
        </div>
    );

    // ── Lista de documentos (con visor) ──
    const listaComprobantes = (lista) => (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-700">Comprobantes adjuntados ({lista.length})</p>
            </div>
            <ul className="divide-y divide-gray-50">
                {lista.map((doc) => {
                    const id = doc.idDocumentoLogistico;
                    const observado = doc.estado === 'Observado';
                    return (
                        <li key={id} className="px-5 py-3 flex items-center gap-3">
                            <svg className={`w-5 h-5 shrink-0 ${observado ? 'text-red-400' : 'text-[#008b9c]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-700 truncate">{doc.nombreArchivo}</p>
                                <p className="text-xs text-gray-400">{fmtTamano(doc.tamanoBytes)} · Cargado el {fmtFecha(doc.fechaCarga)}</p>
                                {observado && doc.observacion && (
                                    <p className="text-xs text-red-600 mt-0.5">Observación: {doc.observacion}</p>
                                )}
                            </div>
                            {observado && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 shrink-0">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                    Rechazado
                                </span>
                            )}
                            <button
                                onClick={() => setVisorDoc(visorDoc?.idDocumentoLogistico === id ? null : doc)}
                                title="Previsualizar"
                                className={`p-2 rounded-lg transition-colors shrink-0 ${visorDoc?.idDocumentoLogistico === id ? 'bg-[#008b9c] text-white' : 'text-[#008b9c] hover:bg-[#e0f7fa]'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    const btnVolver = (
        <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            ← Volver
        </button>
    );

    // ── Cargando ──
    if (cargandoDocs) {
        return (
            <div className="max-w-2xl mx-auto">
                {btnVolver}
                <div className="flex items-center justify-center gap-2 py-20 text-gray-400 text-sm">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando comprobantes...
                </div>
            </div>
        );
    }

    // ── Pago validado: solo lectura, sin panel tributario ──
    if (despacho?.estado === 'Tributos Cancelados') {
        return (
            <>
                {modalVisor}
                <div className="max-w-2xl mx-auto">
                    {btnVolver}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Comprobantes de Pago</h1>
                    <p className="text-sm text-gray-500 mb-2">
                        Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Pago validado
                        </span>
                    </div>
                    {docsGuardados.length > 0
                        ? listaComprobantes(docsGuardados)
                        : <p className="text-sm text-gray-400">No hay comprobantes registrados.</p>}
                    <div className="mt-6">
                        <button onClick={onVolver} className="px-6 py-2.5 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                            Volver
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ── En revisión: solo lectura + panel tributario ──
    if (despacho?.estado === 'Pago en Verificación') {
        return (
            <>
                {modalVisor}
                <div className="max-w-5xl mx-auto">
                    {btnVolver}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Comprobantes de Pago</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                    </p>
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 min-w-0">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 mb-4">
                                El envío ya fue realizado. El equipo administrativo está revisando tus comprobantes.
                            </div>
                            {docsGuardados.length > 0
                                ? listaComprobantes(docsGuardados)
                                : <p className="text-sm text-gray-400">No hay comprobantes registrados.</p>}
                        </div>
                        <div className="w-64 shrink-0">{panelTributario}</div>
                    </div>
                </div>
            </>
        );
    }

    // ── Confirmación tras envío exitoso en esta sesión ──
    if (procesado) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-800">Comprobantes enviados correctamente.</p>
                        <p className="text-sm text-green-600 mt-0.5">El equipo administrativo los revisará en breve.</p>
                    </div>
                </div>
                <button onClick={onVolver} className="mt-6 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Volver
                </button>
            </div>
        );
    }

    // ── Formulario de subida (estado Pendiente de Pago) ──
    // Docs previos rechazados (si los hay, mostrar aviso de re-subida)
    const docsObservados = docsGuardados.filter(d => d.estado === 'Observado');

    return (
        <>
            {modalVisor}
            <div className="max-w-5xl mx-auto">
                {btnVolver}
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Comprobantes de Pago</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                </p>

                <div className="flex gap-6 items-start">
                    <div className="flex-1 min-w-0">

                        {/* Aviso de rechazo si hay docs observados */}
                        {docsObservados.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 mb-4">
                                <p className="font-bold mb-1">Comprobante rechazado</p>
                                <p className="mb-3">El administrador rechazó tu comprobante anterior. Por favor adjunta uno nuevo.</p>
                                {listaComprobantes(docsObservados)}
                            </div>
                        )}

                        {/* Zona drag & drop */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-4 ${
                                dragging ? 'border-[#008b9c] bg-[#e0f7fa]' : 'border-gray-300 bg-gray-50 hover:border-[#008b9c] hover:bg-[#f0fbfc]'
                            }`}
                        >
                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-700">Arrastra tus comprobantes aquí o haz clic para seleccionar</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Máximo 10 MB por archivo</p>
                            <input
                                ref={inputRef}
                                type="file"
                                multiple
                                accept={EXTENSIONES_VALIDAS.join(',')}
                                onChange={handleChange}
                                className="hidden"
                            />
                        </div>

                        {errorArchivo && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                                {errorArchivo}
                            </div>
                        )}

                        {errorProcesar && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                                {errorProcesar}
                            </div>
                        )}

                        {archivos.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                                <div className="px-5 py-3 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-700">Archivos seleccionados ({archivos.length})</p>
                                </div>
                                <ul className="divide-y divide-gray-50">
                                    {archivos.map((f, i) => (
                                        <li key={i} className="px-5 py-3 flex items-center gap-3">
                                            <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-sm text-gray-700 truncate">{f.name}</span>
                                            <span className="text-xs text-gray-400 ml-auto shrink-0">
                                                {(f.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleProcesar}
                                disabled={!puedeProcessar || procesando}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                    !puedeProcessar || procesando
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
                                    'PROCESAR COMPROBANTES'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="w-64 shrink-0">
                        {panelTributario}
                    </div>
                </div>
            </div>
        </>
    );
}
