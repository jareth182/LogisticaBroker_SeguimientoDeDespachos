import { useState, useRef } from 'react';

const TIPOS = [
    { id: 'copia_literal',     nombre: 'Copia Literal' },
    { id: 'dni_representante', nombre: 'DNI Representante Legal' },
    { id: 'vigencia_poder',    nombre: 'Vigencia de Poder' },
];

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

export default function AdjuntarDocumentosLegales({ onAvanzarFirma }) {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('copia_literal');
    const [archivoPendiente, setArchivoPendiente] = useState(null);
    const [documentosCargados, setDocumentosCargados] = useState({});
    const [errorArchivo, setErrorArchivo] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);
    const inputRef = useRef(null);

    const formatBytes = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const validarArchivo = (f) => {
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['pdf', 'xml'].includes(ext)) {
            setErrorArchivo('El formato del archivo no es válido. Solo se aceptan PDF y XML.');
            return false;
        }
        if (f.size > MAX_SIZE) {
            setErrorArchivo('El archivo supera el tamaño máximo permitido de 15 MB.');
            return false;
        }
        setErrorArchivo('');
        return true;
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (validarArchivo(f)) setArchivoPendiente(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        if (validarArchivo(f)) setArchivoPendiente(f);
    };

    const handleDragOver = (e) => { e.preventDefault(); setArrastrando(true); };
    const handleDragLeave = () => setArrastrando(false);

    const handleSubir = () => {
        if (!archivoPendiente) {
            setErrorArchivo('Debes seleccionar un archivo antes de continuar.');
            return;
        }
        const fakeUrl = `https://storage.fake/docs/${Date.now()}_${archivoPendiente.name}`;
        setDocumentosCargados(prev => ({
            ...prev,
            [tipoSeleccionado]: { nombre: archivoPendiente.name, url: fakeUrl, tamanio: formatBytes(archivoPendiente.size) },
        }));
        setArchivoPendiente(null);
        setErrorArchivo('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleGuardarBorrador = async () => {
        setGuardando(true);
        await new Promise(r => setTimeout(r, 500));
        setGuardando(false);
    };

    const todosCompletos = TIPOS.every(t => documentosCargados[t.id]);
    const hayAlMenosUno  = Object.keys(documentosCargados).length > 0 || archivoPendiente !== null;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Documentos Legales</h1>
            <p className="text-sm text-gray-500 mb-6 max-w-2xl">
                Cargue los documentos requeridos para completar el proceso de registro.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Panel izquierdo: requisitos ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Documentos Requeridos</h2>
                    <div className="space-y-2">
                        {TIPOS.map(t => {
                            const cargado = !!documentosCargados[t.id];
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => { setTipoSeleccionado(t.id); setArchivoPendiente(null); setErrorArchivo(''); }}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                                        tipoSeleccionado === t.id
                                            ? 'border-[#1a2540] bg-[#f0f4ff]'
                                            : cargado
                                                ? 'border-green-300 bg-green-50/60'
                                                : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            tipoSeleccionado === t.id ? 'border-[#1a2540]' : 'border-gray-300'
                                        }`}>
                                            {tipoSeleccionado === t.id && <div className="w-2 h-2 rounded-full bg-[#1a2540]" />}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{t.nombre}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                        cargado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {cargado ? 'CARGADO' : 'PENDIENTE'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {Object.keys(documentosCargados).length > 0 && (
                        <div className="mt-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentos cargados</p>
                            <div className="space-y-2">
                                {TIPOS.filter(t => documentosCargados[t.id]).map(t => {
                                    const doc = documentosCargados[t.id];
                                    return (
                                        <div key={t.id} className="flex items-center gap-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800">{t.nombre}</p>
                                                <p className="text-[11px] text-gray-400 truncate">{doc.nombre} · {doc.tamanio}</p>
                                            </div>
                                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Panel derecho: área de carga ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Área de Carga</p>

                    <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                        Cargando para: <span className="font-bold">{TIPOS.find(t => t.id === tipoSeleccionado)?.nombre}</span>
                    </div>

                    <div
                        className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${
                            arrastrando ? 'border-[#1a2540] bg-blue-50' : 'bg-gray-50 hover:border-gray-300'
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.xml"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        {archivoPendiente ? (
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[#1a2540]">{archivoPendiente.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatBytes(archivoPendiente.size)}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm font-semibold text-gray-700 mb-1 text-center">
                                    Arrastra y suelta tus archivos aquí
                                </p>
                                <p className="text-xs text-gray-400 text-center mb-3">o</p>
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Explorar archivos
                                </button>
                                <p className="text-xs text-gray-400 mt-3">Formatos soportados: .PDF, .XML · Máximo 15 MB</p>
                            </>
                        )}
                    </div>

                    {errorArchivo && (
                        <p className="mt-2 text-xs text-red-500 font-medium">{errorArchivo}</p>
                    )}

                    <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubir}
                                className="px-5 py-2.5 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                Subir Documentos
                            </button>
                            <button
                                onClick={() => todosCompletos && onAvanzarFirma?.()}
                                disabled={!todosCompletos}
                                className={`px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-colors ${
                                    todosCompletos
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-300 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
