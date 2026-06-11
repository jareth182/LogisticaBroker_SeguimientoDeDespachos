import { useState, useRef } from 'react';

const FORMATOS_IMG = ['image/jpeg', 'image/png'];

export default function ConfirmarEntrega({ despacho, onVolver, usuario }) {
    const [acta, setActa] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errorArchivo, setErrorArchivo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [entregado, setEntregado] = useState(false);
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const seleccionar = (file) => {
        if (!file) return;
        if (!FORMATOS_IMG.includes(file.type)) {
            setErrorArchivo('El acta debe ser una imagen en formato JPG o PNG');
            return;
        }
        setErrorArchivo('');
        setActa(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        seleccionar(e.dataTransfer.files?.[0]);
    };

    // CA1: requiere la foto del Acta de Recepción firmada
    const puedeCerrar = acta !== null && !errorArchivo;

    const handleCerrar = () => {
        if (!puedeCerrar || procesando) return;
        setProcesando(true);
        setError('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setEntregado(true);
            } catch {
                setProcesando(false);
                setError('Error al cerrar el servicio de transporte. Intenta nuevamente');
            }
        }, 1000);
    };

    if (entregado) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        {/* CA1: estado operativo actualizado a "Entregado" */}
                        <p className="text-base font-bold text-green-800">Servicio de transporte cerrado. El estado operativo se actualizó a "Entregado".</p>
                        {/* Detalle HU21: última actualización visible para el cliente */}
                        <p className="text-sm text-green-600 mt-0.5">
                            Esta es la última actualización del estado que el cliente visualizará en su flujo de seguimiento principal.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Registrado por: <span className="font-semibold">{usuario?.nombreCompleto ?? 'Jefe de Operaciones'}</span> · {new Date().toLocaleString('es-PE')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onVolver}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirmar Entrega de Mercancía</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Acta de Recepción firmada</p>

                {/* CA1: adjuntar foto del Acta de Recepción firmada */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        dragging ? 'border-[#008b9c] bg-[#e0f7fa]' : 'border-gray-300 bg-gray-50 hover:border-[#008b9c] hover:bg-[#f0fbfc]'
                    }`}
                >
                    {preview ? (
                        <img src={preview} alt="Acta de recepción" className="max-h-56 mx-auto rounded-lg object-contain" />
                    ) : (
                        <>
                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-700">Arrastra la foto del acta firmada o haz clic para tomar/seleccionar</p>
                            <p className="text-xs text-gray-400 mt-1">JPG o PNG</p>
                        </>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        capture="environment"
                        onChange={e => { seleccionar(e.target.files?.[0]); e.target.value = ''; }}
                        className="hidden"
                    />
                </div>
                {acta && <p className="text-xs text-gray-500 mt-2 truncate">Archivo: {acta.name}</p>}
            </div>

            {errorArchivo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{errorArchivo}</div>
            )}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
            )}

            {/* CA1: botón CERRAR SERVICIO DE TRANSPORTE */}
            <div className="flex justify-end">
                <button
                    onClick={handleCerrar}
                    disabled={!puedeCerrar || procesando}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                        !puedeCerrar || procesando
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
                            Cerrando...
                        </>
                    ) : (
                        'CERRAR SERVICIO DE TRANSPORTE'
                    )}
                </button>
            </div>
        </div>
    );
}
