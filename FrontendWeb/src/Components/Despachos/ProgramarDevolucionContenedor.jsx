import { useState } from 'react';

export default function ProgramarDevolucionContenedor({ despacho, onVolver, usuario }) {
    // Detalle HU22: paso opcional si la importación es carga suelta (LCL)
    const [tipoImportacion, setTipoImportacion] = useState('FCL');
    const [fechaLimite, setFechaLimite] = useState('');
    const [lugarEntrega, setLugarEntrega] = useState('');
    const [intento, setIntento] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');

    const esLCL = tipoImportacion === 'LCL';

    // CA1: fecha límite de retorno y lugar de entrega
    const camposCompletos = fechaLimite !== '' && lugarEntrega.trim() !== '';

    const handleConfirmar = () => {
        setIntento(true);
        setError('');
        if (!camposCompletos || procesando) return;
        setProcesando(true);
        setTimeout(() => {
            try {
                setProcesando(false);
                setResultado({ tipo: 'programado', fechaLimite, lugarEntrega });
            } catch {
                setProcesando(false);
                setError('Error al confirmar la programación. Intenta nuevamente');
            }
        }, 1000);
    };

    // Detalle HU22: permitir saltar el paso cuando es carga suelta LCL
    const handleOmitir = () => {
        setResultado({ tipo: 'omitido' });
    };

    if (resultado) {
        const omitido = resultado.tipo === 'omitido';
        return (
            <div className="max-w-3xl mx-auto">
                <div className={`border rounded-xl p-6 flex items-start gap-4 mb-6 ${omitido ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${omitido ? 'bg-gray-100' : 'bg-green-100'}`}>
                        <svg className={`w-6 h-6 ${omitido ? 'text-gray-500' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {omitido
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />}
                        </svg>
                    </div>
                    <div>
                        {omitido ? (
                            <>
                                <p className="text-base font-bold text-gray-700">Paso omitido</p>
                                <p className="text-sm text-gray-500 mt-0.5">La importación es carga suelta (LCL); no requiere devolución de contenedor.</p>
                            </>
                        ) : (
                            <>
                                {/* CA1: recordatorio interno para el equipo logístico */}
                                <p className="text-base font-bold text-green-800">Programación confirmada.</p>
                                <p className="text-sm text-green-600 mt-0.5">Se generó un recordatorio interno para el equipo logístico.</p>
                                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                                    <p>Fecha límite de retorno: <span className="font-semibold text-gray-700">{new Date(resultado.fechaLimite).toLocaleString('es-PE')}</span></p>
                                    <p>Lugar de entrega: <span className="font-semibold text-gray-700">{resultado.lugarEntrega}</span></p>
                                </div>
                            </>
                        )}
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Programar Devolución de Contenedor</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {/* Tipo de importación — define si el paso es obligatorio u opcional */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de importación</label>
                    <select
                        value={tipoImportacion}
                        onChange={e => setTipoImportacion(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]"
                    >
                        <option value="FCL">FCL — Contenedor completo</option>
                        <option value="LCL">LCL — Carga suelta</option>
                    </select>
                </div>

                {esLCL ? (
                    /* Detalle HU22: carga LCL puede saltar este paso */
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 mb-2">
                        Esta importación es carga suelta (LCL). La devolución de contenedor no aplica y este paso puede omitirse.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Fecha límite de retorno <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={fechaLimite}
                                onChange={e => setFechaLimite(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                                    intento && !fechaLimite ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {intento && !fechaLimite && <p className="text-xs text-red-600 mt-1">La fecha límite de retorno es requerida.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Lugar de entrega <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={lugarEntrega}
                                onChange={e => setLugarEntrega(e.target.value)}
                                placeholder="Ej. Depósito de contenedores Callao"
                                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                                    intento && !lugarEntrega.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {intento && !lugarEntrega.trim() && <p className="text-xs text-red-600 mt-1">El lugar de entrega es requerido.</p>}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    {esLCL ? (
                        <button
                            onClick={handleOmitir}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shadow-sm"
                        >
                            OMITIR PASO (CARGA LCL)
                        </button>
                    ) : (
                        /* CA1: botón CONFIRMAR PROGRAMACIÓN */
                        <button
                            onClick={handleConfirmar}
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
                                    Confirmando...
                                </>
                            ) : (
                                'CONFIRMAR PROGRAMACIÓN'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
