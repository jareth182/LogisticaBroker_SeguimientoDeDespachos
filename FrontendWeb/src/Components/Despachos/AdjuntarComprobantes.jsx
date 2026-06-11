import { useState, useRef } from 'react';

const FORMATOS_VALIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES_VALIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_BYTES = 10 * 1024 * 1024;

// CA3: comprobantes ya adjuntados en un envío previo (estado "Pago en Verificación")
const COMPROBANTES_ADJUNTADOS = [
    { nombre: 'comprobante_pago_BCP.pdf', tamano: '1.24 MB', fechaCarga: '10/06/2026 09:32', url: null },
    { nombre: 'voucher_interbank.jpg', tamano: '0.86 MB', fechaCarga: '10/06/2026 09:33', url: null },
];

export default function AdjuntarComprobantes({ despacho, onVolver }) {
    const [archivos, setArchivos] = useState([]);
    const [errorArchivo, setErrorArchivo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [procesado, setProcesado] = useState(false);
    const [errorProcesar, setErrorProcesar] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const validarArchivo = (f) => {
        // CA2.2: formato no permitido
        if (!FORMATOS_VALIDOS.includes(f.type)) {
            setErrorArchivo('El formato del archivo no es válido. Solo se aceptan PDF, JPG y PNG');
            return false;
        }
        // CA2.3: tamaño máximo 10 MB
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

    // CA2.1: botón deshabilitado si no hay archivos válidos
    const puedeProcessar = archivos.length > 0 && !errorArchivo;

    const handleProcesar = () => {
        if (!puedeProcessar || procesando) return;
        setProcesando(true);
        setErrorProcesar('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setProcesado(true);
            } catch {
                // CA2.4: error de conexión
                setProcesando(false);
                setErrorProcesar('Error al enviar los comprobantes. Intenta nuevamente');
            }
        }, 1200);
    };

    // CA3: re-acceso con estado "Pago en Verificación" — solo lectura, envío ya realizado
    const yaEnviado = despacho?.estado === 'Pago en Verificación';
    if (yaEnviado && !procesado) {
        return (
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onVolver}
                    className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    ← Volver
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Comprobantes de Pago</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
                </p>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 mb-6">
                    El envío ya fue realizado. El equipo administrativo está revisando tus comprobantes (estado: Pago en Verificación).
                </div>

                {/* CA3: zona de carga deshabilitada */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-100 opacity-60 cursor-not-allowed mb-4">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-400">La carga de archivos está deshabilitada</p>
                    <p className="text-xs text-gray-400 mt-1">Los comprobantes ya fueron enviados a revisión</p>
                </div>

                {/* CA3: listado de comprobantes adjuntados — nombre, tamaño, fecha de carga, ícono de descarga */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                    <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-700">Comprobantes adjuntados ({COMPROBANTES_ADJUNTADOS.length})</p>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {COMPROBANTES_ADJUNTADOS.map((c, i) => (
                            <li key={i} className="px-5 py-3 flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-700 truncate">{c.nombre}</p>
                                    <p className="text-xs text-gray-400">{c.tamano} · Cargado el {c.fechaCarga}</p>
                                </div>
                                {/* CA3: ícono de descarga disponible */}
                                <a
                                    href={c.url ?? '#'}
                                    download={c.nombre}
                                    title="Descargar"
                                    className="ml-auto p-2 text-gray-400 hover:text-[#008b9c] transition-colors shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CA3: botón PROCESAR COMPROBANTES deshabilitado — envío ya realizado */}
                <div className="flex justify-end">
                    <button
                        disabled
                        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-sm"
                    >
                        PROCESAR COMPROBANTES
                    </button>
                </div>
            </div>
        );
    }

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
                        {/* CA2: MSG exacto del criterio de aceptación */}
                        <p className="text-base font-bold text-green-800">Comprobantes enviados correctamente.</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            El equipo administrativo los revisará en breve.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onVolver}
                    className="mt-6 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={onVolver}
                className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                ← Volver
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Adjuntar Comprobantes de Pago</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {/* CA1 + CA2.2 + CA2.3: zona drag & drop */}
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

            {/* CA2.2 / CA2.3: MSG error de archivo */}
            {errorArchivo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {errorArchivo}
                </div>
            )}

            {/* CA2.4: MSG error de conexión */}
            {errorProcesar && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {errorProcesar}
                </div>
            )}

            {/* Listado de archivos seleccionados */}
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

            {/* CA2: botón PROCESAR COMPROBANTES — deshabilitado hasta adjuntar al menos un archivo */}
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
    );
}
