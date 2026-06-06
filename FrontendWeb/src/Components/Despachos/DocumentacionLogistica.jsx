import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5018/api/DocumentosLogisticos';
const TIPOS = ['Factura Comercial', 'Packing List', 'Bill of Lading', 'Otros'];

function icono(nombre) {
    const ext = nombre.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext))
        return { bg: 'bg-purple-100', color: 'text-purple-600', label: 'IMG' };
    if (['xls', 'xlsx'].includes(ext))
        return { bg: 'bg-green-100', color: 'text-green-600', label: 'XLS' };
    return { bg: 'bg-red-100', color: 'text-red-600', label: 'PDF' };
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFecha(iso) {
    const d = new Date(iso);
    const hoy = new Date();
    const diff = Math.floor((hoy - d) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentacionLogistica({ despacho, onVolver }) {
    const [docs, setDocs]         = useState([]);
    const [loading, setLoading]   = useState(true);
    const [tipo, setTipo]         = useState('');
    const [archivo, setArchivo]   = useState(null);
    const [dragging, setDragging] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const [mensaje, setMensaje]   = useState(null);
    const inputRef = useRef();

    useEffect(() => { cargar(); }, [despacho.idDespacho]);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/${despacho.idDespacho}`);
            if (res.ok) setDocs(await res.json()); // PA HU09-1 OK — lista de documentos cargada
        } catch { /* PA HU09-1.2 NOK — sin conexión, pantalla no carga */ }
        finally { setLoading(false); }
    };

    const validarArchivo = (file) => {
        if (!file) return null;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx'].includes(ext))
            return 'Formato no admitido. Solo se permiten archivos PDF, JPG, PNG o Excel.'; // PA HU09-2.2 NOK — extensión no permitida (.exe, .doc, etc.)
        if (file.size > 10 * 1024 * 1024)
            return 'El archivo supera el límite permitido de 10 MB. Comprima o reduzca el tamaño antes de subirlo.'; // PA HU09-2.1 NOK — tamaño excede 10 MB
        return null; // PA HU09-2 OK — archivo válido (formato y tamaño correctos)
    };

    const onFileChange = (file) => {
        const err = validarArchivo(file);
        if (err) { setMensaje({ tipo: 'error', texto: err }); setArchivo(null); return; }
        setMensaje(null);
        setArchivo(file);
    };

    const handleDrop = (e) => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileChange(file);
    };

    const handleSubir = async () => {
        if (!tipo) { // PA HU09-2.3 NOK — tipo de documento no seleccionado
            setMensaje({ tipo: 'error', texto: 'Debe seleccionar el tipo de documento antes de subir el archivo.' });
            return;
        }
        if (!archivo) { // guarda: archivo no elegido aún (cubierto por validarArchivo)
            setMensaje({ tipo: 'error', texto: 'Debe seleccionar un archivo antes de subir.' });
            return;
        }
        setSubiendo(true);
        setMensaje(null);
        const form = new FormData();
        form.append('TipoDocumento', tipo);
        form.append('Archivo', archivo);
        try {
            const res = await fetch(`${API}/${despacho.idDespacho}/subir`, { method: 'POST', body: form });
            const data = await res.json();
            if (res.ok) { // PA HU09-2 OK — archivo subido y asociado al despacho
                setMensaje({ tipo: 'exito', texto: 'Archivo asociado exitosamente al despacho.' });
                setArchivo(null); setTipo('');
                if (inputRef.current) inputRef.current.value = '';
                cargar();
            } else { // PA HU09-2.4 NOK — servidor responde con error (p.ej. formato/tamaño rechazado en backend)
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al subir el documento. Verifique su conexión e intente nuevamente.' });
            }
        } catch { // PA HU09-2.4 NOK — error de red / sin conexión al subir
            setMensaje({ tipo: 'error', texto: 'Error al subir el documento. Verifique su conexión e intente nuevamente.' });
        } finally { setSubiendo(false); }
    };

    const handleDescargar = async (doc) => {
        try {
            const res = await fetch(`${API}/descargar/${doc.idDocumentoLogistico}`);
            if (res.ok) { // PA HU09-3 OK — descarga exitosa, se abre la URL del archivo
                const data = await res.json();
                window.open(data.rutaArchivo, '_blank');
            } else { // PA HU09-3.2 NOK — archivo no disponible en servidor (404)
                alert('No se pudo descargar el documento. Verifique su conexión e intente nuevamente.');
            }
        } catch { // PA HU09-3.1 NOK — error de red al intentar descargar
            alert('No se pudo descargar el documento. Verifique su conexión e intente nuevamente.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="hover:text-[#008b9c] cursor-pointer transition-colors" onClick={onVolver}>Despachos Activos</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Adjuntar Documentos</span>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Documentación Logística</h1>
                <div className="flex items-center gap-3 mt-2">
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Referencia BL</p>
                        <p className="text-sm font-bold text-gray-800 font-mono">{despacho.codigoBl}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {despacho.estado || 'En Tránsito'}
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                    {[
                        { label: 'Cliente', value: despacho.razonSocial },
                        { label: 'Código', value: despacho.codigoOrden },
                        { label: 'Origen', value: despacho.origen || '—' },
                        { label: 'Destino', value: despacho.destino || '—' },
                    ].map(f => (
                        <div key={f.label}>
                            <p className="text-xs text-gray-400">{f.label}</p>
                            <p className="text-sm font-semibold text-[#008b9c]">{f.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* ── Panel izquierdo: subir ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Adjuntar Nuevo Documento</h2>

                    {/* Tipo de documento */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Documento</label>
                        <select
                            value={tipo}
                            onChange={e => setTipo(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] bg-white"
                        >
                            <option value="">Seleccione un tipo...</option>
                            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Drag & drop */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${
                            dragging ? 'border-[#008b9c] bg-[#e0f7fa]' :
                            archivo  ? 'border-green-400 bg-green-50' :
                                       'border-gray-300 bg-gray-50 hover:border-[#008b9c] hover:bg-[#f0fbfc]'
                        }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
                            className="hidden"
                            onChange={e => onFileChange(e.target.files[0])}
                        />
                        {archivo ? (
                            <>
                                <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <p className="text-sm font-semibold text-green-700 text-center">{archivo.name}</p>
                                <p className="text-xs text-green-500">{formatBytes(archivo.size)}</p>
                            </>
                        ) : (
                            <>
                                <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p className="text-sm font-semibold text-gray-600">Arrastra y suelta tus archivos aquí</p>
                                <p className="text-xs text-gray-400 mt-1">o haz clic para explorar en tu dispositivo</p>
                                <p className="text-xs text-gray-400 mt-1">Soporta PDF, XLS, JPG, PNG (Max. 10MB)</p>
                            </>
                        )}
                    </div>

                    {/* Mensaje */}
                    {mensaje && (
                        <div className={`p-3 rounded-lg text-sm mb-3 ${
                            mensaje.tipo === 'exito'
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <button
                        onClick={handleSubir}
                        disabled={subiendo}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                            subiendo
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#1a2540] hover:bg-[#0f1a30]'
                        }`}
                    >
                        {subiendo ? 'Subiendo...' : 'Subir Documentos'}
                    </button>
                </div>

                {/* ── Panel derecho: lista ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-800">Archivos Adjuntos</h2>
                        <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                            {docs.length} {docs.length === 1 ? 'Archivo' : 'Archivos'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <svg className="w-6 h-6 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <p className="text-sm">No hay documentos adjuntos aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-96">
                            {docs.map(doc => {
                                const ic = icono(doc.nombreArchivo);
                                return (
                                    <div key={doc.idDocumentoLogistico} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className={`w-10 h-10 rounded-lg ${ic.bg} flex items-center justify-center shrink-0`}>
                                            <span className={`text-xs font-bold ${ic.color}`}>{ic.label}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{doc.nombreArchivo}</p>
                                            <p className="text-xs text-gray-400">
                                                {doc.tipoDocumento} · {formatBytes(doc.tamanoBytes)} · {formatFecha(doc.fechaCarga)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDescargar(doc)}
                                            title="Descargar"
                                            className="p-1.5 rounded-lg hover:bg-[#e0f7fa] text-gray-400 hover:text-[#008b9c] transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Botón volver */}
            <div className="mt-4">
                <button
                    onClick={onVolver}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Volver a Despachos
                </button>
            </div>
        </div>
    );
}
