import { useState, useRef } from 'react';

const FORMATOS_VALIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES_VALIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];
// Detalle HU19: peso máximo 5 MB por archivo
const MAX_BYTES = 5 * 1024 * 1024;

export default function RegistrarComprobantesLogisticos({ despacho, onVolver, onAsignarTransporte }) {
    const [archivos, setArchivos] = useState([]);
    const [errorArchivo, setErrorArchivo] = useState('');
    const [vistoBueno, setVistoBueno] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [registrado, setRegistrado] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const validarArchivo = (f) => {
        if (!FORMATOS_VALIDOS.includes(f.type)) {
            setErrorArchivo('El formato del archivo no es válido. Solo se aceptan PDF, JPG y PNG');
            return false;
        }
        // Detalle HU19: límite de 5 MB por archivo
        if (f.size > MAX_BYTES) {
            setErrorArchivo('El archivo supera el tamaño máximo permitido de 5 MB');
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

    // CA1: requiere al menos un comprobante adjunto
    const puedeRegistrar = archivos.length > 0 && !errorArchivo;

    const handleRegistrar = () => {
        if (!puedeRegistrar || procesando) return;
        setProcesando(true);
        setError('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setRegistrado(true);
            } catch {
                setProcesando(false);
                setError('Error al registrar los comprobantes logísticos. Intenta nuevamente');
            }
        }, 1100);
    };

    if (registrado) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-800">Comprobantes logísticos registrados.</p>
                        {/* CA1: archivos guardados y listados para la liquidación final */}
                        <p className="text-sm text-green-600 mt-0.5">
                            Los archivos se guardaron en el repositorio del despacho y quedaron listados para la liquidación final.
                        </p>
                    </div>
                </div>

                {/* CA2: al marcar "Visto Bueno Portuario" y registrar, se habilita asignar transporte terrestre */}
                {vistoBueno ? (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Transporte terrestre habilitado</p>
                            <p className="text-xs text-gray-500 mt-0.5">El Visto Bueno Portuario fue confirmado. Ya puedes programar el retiro de la carga.</p>
                        </div>
                        <button
                            onClick={() => onAsignarTransporte?.(despacho)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9c] hover:bg-[#007685] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                        >
                            ASIGNAR TRANSPORTE TERRESTRE
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                        Marca el "Visto Bueno Portuario" para habilitar la asignación de transporte terrestre.
                    </div>
                )}

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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrar Comprobantes Logísticos</h1>
            <p className="text-sm text-gray-500 mb-1">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>
            {/* CA1: pestaña "Operaciones" */}
            <p className="text-xs text-[#008b9c] font-semibold uppercase tracking-wide mb-6">Pestaña: Operaciones</p>

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
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {/* Listado de comprobantes (para la liquidación final) */}
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

            {/* CA2: casilla "Visto Bueno Portuario" */}
            <label className="flex items-center gap-3 cursor-pointer mb-5 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <input
                    type="checkbox"
                    checked={vistoBueno}
                    onChange={e => setVistoBueno(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c]"
                />
                <div>
                    <span className="text-sm font-semibold text-gray-700">Visto Bueno Portuario</span>
                    <p className="text-xs text-gray-400">Confirma que los pagos de almacenaje portuario están cancelados. Habilita la asignación de transporte terrestre.</p>
                </div>
            </label>

            {/* CA2: botón REGISTRAR COMPROBANTE */}
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
                    ) : (
                        'REGISTRAR COMPROBANTE'
                    )}
                </button>
            </div>
        </div>
    );
}
