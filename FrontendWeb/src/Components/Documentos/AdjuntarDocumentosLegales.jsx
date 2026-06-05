import { useState, useRef } from 'react';

const REQUISITOS = [
    { id: 'copia_literal',    nombre: 'Copia Literal',           descripcion: 'Antigüedad < 30 días',  icono: 'doc'   },
    { id: 'dni_representante',nombre: 'DNI Representante Legal', descripcion: 'Ambos lados (PDF)',      icono: 'id'    },
    { id: 'vigencia_poder',   nombre: 'Vigencia de Poder',       descripcion: 'Emitido por SUNARP',     icono: 'stamp' },
];

function RequisitoBadge({ estado }) {
    if (estado === 'cargado')
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">CARGADO</span>;
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">PENDIENTE</span>;
}

function RequisitoIcon({ tipo }) {
    if (tipo === 'id') return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
    );
    if (tipo === 'stamp') return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    );
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

export default function AdjuntarDocumentosLegales({ onAvanzarFirma }) {
    const [docSeleccionado, setDocSeleccionado] = useState('dni_representante');
    const [cargados, setCargados]   = useState({ copia_literal: { nombre: 'copia_literal_v1.pdf', tamanio: '1.2 MB' } });
    const [cola, setCola]           = useState([]);
    const [dragging, setDragging]   = useState(false);
    const [subiendo, setSubiendo]   = useState(false);
    const [exito, setExito]         = useState(false);
    const inputRef = useRef(null);

    const formatBytes = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const MAX_SIZE = 15 * 1024 * 1024;

    const agregarArchivos = (files) => {
        const validos = Array.from(files).filter(f => {
            const ext = f.name.split('.').pop().toLowerCase();
            return ['pdf', 'xml', 'jpg', 'jpeg'].includes(ext) && f.size <= MAX_SIZE;
        });
        setCola(prev => [...prev, ...validos.filter(f => !prev.find(p => p.name === f.name))]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        agregarArchivos(e.dataTransfer.files);
    };

    const handleSubir = async () => {
        if (cola.length === 0 || !docSeleccionado) return;
        setSubiendo(true);
        await new Promise(r => setTimeout(r, 900));

        const archivo = cola[0];
        setCargados(prev => ({
            ...prev,
            [docSeleccionado]: { nombre: archivo.name, tamanio: formatBytes(archivo.size) }
        }));
        setCola([]);
        setSubiendo(false);
        setExito(true);
        setTimeout(() => setExito(false), 3000);
    };

    const eliminarCargado = (id) => {
        setCargados(prev => { const c = { ...prev }; delete c[id]; return c; });
    };

    const todosCargados = REQUISITOS.every(r => cargados[r.id]);

    return (
        <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span>Onboarding Corporativo</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-blue-600 font-medium">Paso 5 de 8</span>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Documentos Legales</h1>
            <p className="text-sm text-gray-500 mb-6 max-w-2xl">
                Para finalizar el registro de su entidad, necesitamos validar la representación legal.
                Por favor, cargue los documentos solicitados a continuación en formato PDF.
            </p>

            {/* Toast éxito */}
            {exito && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Archivo adjuntado correctamente al expediente.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Panel izquierdo: Requisitos ── */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <h2 className="text-base font-bold text-gray-800">Requisitos Obligatorios</h2>
                        </div>

                        <div className="space-y-3">
                            {REQUISITOS.map(r => {
                                const estado = cargados[r.id] ? 'cargado' : 'pendiente';
                                const seleccionado = docSeleccionado === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => setDocSeleccionado(r.id)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                                            seleccionado
                                                ? 'border-blue-400 bg-blue-50'
                                                : estado === 'cargado'
                                                    ? 'border-green-200 bg-green-50/40'
                                                    : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                estado === 'cargado' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                <RequisitoIcon tipo={r.icono} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{r.nombre}</p>
                                                <p className="text-xs text-gray-500">{r.descripcion}</p>
                                            </div>
                                        </div>
                                        <RequisitoBadge estado={estado} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 mb-1">Seguridad de la Información</p>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Todos los documentos cargados están encriptados bajo el estándar AES-256
                                    y solo serán accesibles por el personal autorizado de evaluación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Panel derecho: Área de carga ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Área de Carga</p>
                        <p className="text-xs text-gray-400">Max: 15MB por archivo</p>
                    </div>

                    {/* Indicador de doc seleccionado */}
                    {docSeleccionado && (
                        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">
                            Cargando para: <span className="font-bold">{REQUISITOS.find(r => r.id === docSeleccionado)?.nombre}</span>
                        </div>
                    )}

                    {/* Zona drag & drop */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer ${
                            dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.xml,.jpg,.jpeg"
                            multiple
                            className="hidden"
                            onChange={e => agregarArchivos(e.target.files)}
                        />
                        <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mb-1 text-center">
                            Arrastra y suelta tus archivos aquí
                        </p>
                        <p className="text-xs text-gray-400 text-center mb-4">
                            o si prefieres, explora tu equipo para seleccionarlos manualmente.
                        </p>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            Explorar archivos
                        </button>
                        <p className="text-[11px] text-gray-400 mt-3">Formatos soportados: .PDF, .XML</p>
                    </div>

                    {/* Archivos en cola */}
                    {cola.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {cola.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                                        <p className="text-[11px] text-gray-400">{formatBytes(f.size)}</p>
                                    </div>
                                    <button onClick={() => setCola(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Archivos ya cargados */}
                    {Object.entries(cargados).length > 0 && (
                        <div className="mt-3 space-y-2">
                            {Object.entries(cargados).map(([id, info]) => {
                                const req = REQUISITOS.find(r => r.id === id);
                                return (
                                    <div key={id} className="flex items-center gap-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{info.nombre}</p>
                                            <p className="text-[11px] text-gray-400">{info.tamanio} · {req?.nombre}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <button onClick={() => eliminarCargado(id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex items-center justify-end gap-4 mt-5 pt-4 border-t border-gray-100">
                        <button className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                            Guardar borrador
                        </button>

                        {todosCargados ? (
                            <button
                                onClick={onAvanzarFirma}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Avanzar a Firma del Contrato
                            </button>
                        ) : (
                            <button
                                onClick={handleSubir}
                                disabled={subiendo || cola.length === 0}
                                className={`flex items-center gap-2 px-5 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg transition-colors ${
                                    subiendo || cola.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#243050]'
                                }`}
                            >
                                {subiendo ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                        </svg>
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        SUBIR DOCUMENTOS
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
