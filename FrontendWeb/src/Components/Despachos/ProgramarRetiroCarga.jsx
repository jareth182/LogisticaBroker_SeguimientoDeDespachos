import { useState } from 'react';

export default function ProgramarRetiroCarga({ despacho, onVolver, usuario }) {
    const [transportista, setTransportista] = useState('');
    const [placa, setPlaca] = useState('');
    const [fechaRetiro, setFechaRetiro] = useState('');
    const [fechaLlegada, setFechaLlegada] = useState('');
    const [intento, setIntento] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');

    // CA1: datos del transportista y fecha de retiro; Detalle HU20: placa obligatoria
    const camposCompletos = transportista.trim() !== '' && placa.trim() !== '' && fechaRetiro !== '';

    const handleGuardar = () => {
        setIntento(true);
        setError('');
        if (!camposCompletos || procesando) return;
        setProcesando(true);
        setTimeout(() => {
            try {
                setProcesando(false);
                setResultado({
                    transportista,
                    placa,
                    fechaRetiro,
                    fechaLlegada,
                    usuario: usuario?.nombreCompleto ?? 'Jefe de Operaciones',
                });
            } catch {
                setProcesando(false);
                setError('Error al guardar la programación. Intenta nuevamente');
            }
        }, 1000);
    };

    if (resultado) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        {/* CA1: estado actualizado a "En Tránsito" */}
                        <p className="text-base font-bold text-green-800">Programación guardada. El despacho cambió a estado "En Tránsito".</p>
                        {/* CA2: notificación automática al cliente con fecha/hora estimada de llegada */}
                        <p className="text-sm text-green-600 mt-0.5">
                            Se notificó automáticamente al cliente la fecha y hora estimada de llegada de su mercancía
                            {resultado.fechaLlegada ? `: ${new Date(resultado.fechaLlegada).toLocaleString('es-PE')}.` : '.'}
                        </p>
                        <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                            <p>Transportista: <span className="font-semibold text-gray-700">{resultado.transportista}</span></p>
                            <p>Placa: <span className="font-semibold text-gray-700">{resultado.placa}</span></p>
                            <p>Fecha de retiro: <span className="font-semibold text-gray-700">{new Date(resultado.fechaRetiro).toLocaleString('es-PE')}</span></p>
                        </div>
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Programar Retiro de Carga</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Transportista <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={transportista}
                            onChange={e => { setTransportista(e.target.value); }}
                            placeholder="Ej. Transportes Andinos S.A.C. — chofer Luis Ramírez"
                            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                                intento && !transportista.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {intento && !transportista.trim() && <p className="text-xs text-red-600 mt-1">El transportista es requerido.</p>}
                    </div>

                    <div>
                        {/* Detalle HU20: placa obligatoria por seguridad y control logístico */}
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Placa del vehículo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={placa}
                            onChange={e => setPlaca(e.target.value.toUpperCase())}
                            placeholder="Ej. ABC-123"
                            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 uppercase focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                                intento && !placa.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {intento && !placa.trim() && <p className="text-xs text-red-600 mt-1">La placa del vehículo es obligatoria.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Fecha de retiro <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={fechaRetiro}
                            onChange={e => setFechaRetiro(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                                intento && !fechaRetiro ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {intento && !fechaRetiro && <p className="text-xs text-red-600 mt-1">La fecha de retiro es requerida.</p>}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Fecha y hora estimada de llegada (cliente)
                        </label>
                        <input
                            type="datetime-local"
                            value={fechaLlegada}
                            onChange={e => setFechaLlegada(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]"
                        />
                    </div>
                </div>

                {/* CA1: botón GUARDAR PROGRAMACIÓN */}
                <div className="flex justify-end">
                    <button
                        onClick={handleGuardar}
                        disabled={procesando}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            !camposCompletos || procesando
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
                                Guardando...
                            </>
                        ) : (
                            'GUARDAR PROGRAMACIÓN'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
