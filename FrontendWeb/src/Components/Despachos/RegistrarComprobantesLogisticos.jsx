import { useState, useRef, useEffect } from 'react';

const API_BASE  = 'http://localhost:5018/api/DocumentosLogisticos';
const API_ITEMS = 'http://localhost:5018/api/ItemsFactura';
const FORMATOS_VALIDOS   = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES_VALIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_BYTES      = 5 * 1024 * 1024;
const TIPO_DOCUMENTO = 'Comprobante de Pago Logístico';
const TIPO_CAMBIO    = 3.40;

function fmtTamano(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function fmtFecha(f) { return f ? new Date(f).toLocaleString('es-PE') : '—'; }

export default function RegistrarComprobantesLogisticos({ despacho, onVolver, onAsignarTransporte, usuario }) {
    const [archivos, setArchivos]       = useState([]);
    const [errorArchivo, setErrorArchivo] = useState('');
    const [procesando, setProcesando]   = useState(false);
    const [error, setError]             = useState('');
    const [dragging, setDragging]       = useState(false);
    const inputRef = useRef(null);

    const [docsGuardados, setDocsGuardados] = useState([]);
    const [cargandoDocs, setCargandoDocs]   = useState(true);
    const [fob, setFob]                     = useState(null);
    const [visorUrl, setVisorUrl]           = useState(null);
    const [visorNombre, setVisorNombre]     = useState('');
    const [visorEsPdf, setVisorEsPdf]       = useState(false);

    const idDespacho = despacho?.idDespacho;

    useEffect(() => {
        if (!idDespacho) { setCargandoDocs(false); return; }
        Promise.all([
            fetch(`${API_BASE}/${idDespacho}`).then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_ITEMS}/${idDespacho}`).then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([docs, items]) => {
            setDocsGuardados(docs.filter(d => d.tipoDocumento === TIPO_DOCUMENTO));
            const total = items.reduce((s, it) => s + Number(it.cantidad || 0) * Number(it.valor || 0), 0);
            setFob(total > 0 ? total : null);
        }).finally(() => setCargandoDocs(false));
    }, [idDespacho]);

    // Tributos
    const adValorem  = fob ? fob * 0.06 : 0;
    const igv        = fob ? (fob + adValorem) * 0.16 : 0;
    const ipm        = fob ? (fob + adValorem) * 0.02 : 0;
    const percepcion = fob ? (fob + adValorem + igv + ipm) * 0.035 : 0;
    const totalTrib  = adValorem + igv + ipm + percepcion;
    const fmtSoles   = (usd) => (usd * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Docs activos (no rechazados) vs rechazados
    const docsActivos    = docsGuardados.filter(d => d.estado !== 'Observado');
    const docsObservados = docsGuardados.filter(d => d.estado === 'Observado');

    // Mostrar formulario si no hay docs activos (incluye caso de todos rechazados)
    const yaRegistrado = !cargandoDocs && docsActivos.length > 0;

    const validarArchivo = (f) => {
        if (!FORMATOS_VALIDOS.includes(f.type)) {
            setErrorArchivo('El formato del archivo no es válido. Solo se aceptan PDF, JPG y PNG');
            return false;
        }
        if (f.size > MAX_BYTES) {
            setErrorArchivo('El archivo supera el tamaño máximo permitido de 5 MB');
            return false;
        }
        setErrorArchivo('');
        return true;
    };

    const agregarArchivos = (lista) => {
        const validos = [];
        for (const f of Array.from(lista)) {
            if (!validarArchivo(f)) return;
            validos.push(f);
        }
        setArchivos(prev => [...prev, ...validos]);
    };

    const handleDrop   = (e) => { e.preventDefault(); setDragging(false); agregarArchivos(e.dataTransfer.files); };
    const handleChange = (e) => { agregarArchivos(e.target.files); e.target.value = ''; };

    const puedeRegistrar = archivos.length > 0 && !errorArchivo;

    const handleRegistrar = async () => {
        if (!puedeRegistrar || procesando || !idDespacho) return;
        setProcesando(true);
        setError('');
        try {
            const subidos = [];
            for (const archivo of archivos) {
                const form = new FormData();
                form.append('TipoDocumento', TIPO_DOCUMENTO);
                form.append('Archivo', archivo);
                const res = await fetch(`${API_BASE}/${idDespacho}/subir`, { method: 'POST', body: form });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.mensaje ?? 'Error al subir el archivo');
                }
                subidos.push(await res.json());
            }
            setDocsGuardados(prev => [...prev, ...subidos]);
            setArchivos([]);
        } catch (e) {
            setError(e.message ?? 'Error al registrar los comprobantes. Intenta nuevamente.');
        } finally {
            setProcesando(false);
        }
    };

    const abrirVisor = (doc) => {
        const url    = `${API_BASE}/${doc.idDocumentoLogistico}/archivo`;
        const nombre = doc.nombreArchivo ?? doc.nombre ?? '';
        setVisorUrl(url);
        setVisorNombre(nombre);
        setVisorEsPdf(nombre.toLowerCase().endsWith('.pdf'));
    };

    // ── Panel tributario lateral ──
    const panelTributario = (
        <div className="w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-[#1a2540]">
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Monto a Pagar</p>
                    <p className="text-xs text-blue-200 mt-0.5">Tributos calculados · Tipo de cambio S/ {TIPO_CAMBIO}</p>
                </div>
                {fob === null ? (
                    <div className="px-5 py-4 text-xs text-gray-400">Sin datos tributarios disponibles.</div>
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
        </div>
    );

    if (cargandoDocs) {
        return (
            <div className="max-w-2xl mx-auto flex items-center justify-center py-20 gap-3 text-gray-400 text-sm">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cargando documentos...
            </div>
        );
    }

    const esAdmin = usuario?.rol !== 'Cliente';

    const btnVolver = (
        <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            ← Volver
        </button>
    );

    return (
        <>
            {/* Visor modal */}
            {visorUrl && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setVisorUrl(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 truncate">{visorNombre}</p>
                            <div className="flex items-center gap-2 shrink-0">
                                <a href={visorUrl} download={visorNombre}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#008b9c] border border-[#008b9c] rounded-lg hover:bg-[#f0fbfc] transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar
                                </a>
                                <button onClick={() => setVisorUrl(null)} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-2 min-h-0">
                            {visorEsPdf ? (
                                <iframe src={visorUrl} title={visorNombre} className="w-full rounded-lg border border-gray-100" style={{ height: '70vh' }} />
                            ) : (
                                <img src={visorUrl} alt={visorNombre} className="max-w-full mx-auto rounded-lg object-contain" style={{ maxHeight: '70vh' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                {btnVolver}

                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {yaRegistrado ? 'Comprobantes Logísticos del Despacho' : 'Adjuntar Comprobante de Pago Logístico'}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                    Despacho: <span className="font-semibold">{despacho?.codigoBl ?? '—'}</span>
                </p>

                {yaRegistrado ? (
                    /* ── Vista de solo lectura (docs activos) ── */
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-4">
                                {esAdmin ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Vista de revisión
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Comprobantes registrados
                                    </span>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                                <div className="px-5 py-3 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-700">Documentos adjuntados ({docsActivos.length})</p>
                                </div>
                                <ul className="divide-y divide-gray-50">
                                    {docsActivos.map((doc) => (
                                        <li key={doc.idDocumentoLogistico} className="px-5 py-3 flex items-center gap-3">
                                            <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-700 truncate">{doc.nombreArchivo}</p>
                                                <p className="text-xs text-gray-400">{fmtTamano(doc.tamanoBytes)} · Cargado el {fmtFecha(doc.fechaCarga)}</p>
                                            </div>
                                            {doc.estado === 'Aprobado' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 shrink-0">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                                                    Aprobado
                                                </span>
                                            )}
                                            {doc.estado === 'En revisión' && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 shrink-0">
                                                    En revisión
                                                </span>
                                            )}
                                            <button onClick={() => abrirVisor(doc)} title="Ver documento"
                                                className="p-2 text-gray-400 hover:text-[#008b9c] transition-colors shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button onClick={onVolver} className="px-6 py-2.5 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                                Volver
                            </button>
                        </div>
                        {panelTributario}
                    </div>
                ) : (
                    /* ── Formulario de subida ── */
                    <div className="flex gap-6 items-start">
                        <div className="flex-1 min-w-0">

                            {/* Aviso si hay docs rechazados */}
                            {docsObservados.length > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 mb-4">
                                    <p className="font-bold mb-2">Comprobante rechazado — debes subir uno nuevo</p>
                                    <ul className="space-y-1">
                                        {docsObservados.map(doc => (
                                            <li key={doc.idDocumentoLogistico} className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                                <span className="truncate">{doc.nombreArchivo}</span>
                                                {doc.observacion && <span className="text-red-600">— {doc.observacion}</span>}
                                            </li>
                                        ))}
                                    </ul>
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
                                <p className="text-sm font-semibold text-gray-700">Arrastra los comprobantes de pago logístico aquí o haz clic para seleccionar</p>
                                <p className="text-xs text-gray-400 mt-1">Almacenaje y agenciamiento · PDF, JPG, PNG · Máximo 5 MB por archivo</p>
                                <input ref={inputRef} type="file" multiple accept={EXTENSIONES_VALIDAS.join(',')} onChange={handleChange} className="hidden" />
                            </div>

                            {errorArchivo && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{errorArchivo}</div>
                            )}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
                            )}

                            {archivos.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                                    <div className="px-5 py-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-700">Comprobantes adjuntos ({archivos.length})</p>
                                    </div>
                                    <ul className="divide-y divide-gray-50">
                                        {archivos.map((f, i) => (
                                            <li key={i} className="px-5 py-3 flex items-center gap-3">
                                                <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-700 truncate">{f.name}</span>
                                                <span className="text-xs text-gray-400 ml-auto shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleRegistrar}
                                    disabled={!puedeRegistrar || procesando}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                        !puedeRegistrar || procesando
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
                                            Registrando...
                                        </>
                                    ) : 'REGISTRAR COMPROBANTE'}
                                </button>
                            </div>
                        </div>

                        {panelTributario}
                    </div>
                )}
            </div>
        </>
    );
}
