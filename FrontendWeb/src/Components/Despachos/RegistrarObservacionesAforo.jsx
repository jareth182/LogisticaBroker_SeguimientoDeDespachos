import { useState } from 'react';

const MAX_CHARS = 1000;

export default function RegistrarObservacionesAforo({ despacho, onVolver, usuario }) {
    const [observacion, setObservacion] = useState('');
    const [conformidad, setConformidad] = useState(false);
    const [intentoRegistrar, setIntentoRegistrar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [ultimoResultado, setUltimoResultado] = useState(null);
    const [error, setError] = useState('');
    // Detalle HU17: una vez marcada y confirmada la conformidad final, no se admiten nuevas observaciones
    const [conformidadFinal, setConformidadFinal] = useState(false);

    // CA2.1: habilitado si hay texto en observación O casilla marcada
    const puedeRegistrar = observacion.trim() !== '' || conformidad;

    // CA3.1: marcar conformidad deshabilita campo de observación
    const handleConformidadChange = (e) => {
        setConformidad(e.target.checked);
        if (e.target.checked) {
            setObservacion('');
            setIntentoRegistrar(false);
        }
    };

    const handleRegistrar = () => {
        setIntentoRegistrar(true);
        if (!puedeRegistrar || procesando) return;
        setProcesando(true);
        setError('');

        setTimeout(() => {
            try {
                const entrada = {
                    id: Date.now(),
                    texto: conformidad ? 'Revisión conforme — Se solicita levante.' : observacion,
                    esConformidad: conformidad,
                    fecha: new Date().toLocaleDateString('es-PE'),
                    hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                    usuario: usuario?.nombreCompleto ?? 'Despachador',
                };
                setHistorial(prev => [...prev, entrada]);
                setUltimoResultado(conformidad ? 'levante' : 'observado');
                // Detalle HU17: al confirmar la conformidad se bloquea la pantalla para nuevas observaciones
                if (conformidad) setConformidadFinal(true);
                setObservacion('');
                setConformidad(false);
                setIntentoRegistrar(false);
                setProcesando(false);
            } catch {
                // CA2.3 / CA3.2: error de conexión
                setProcesando(false);
                setError(conformidad
                    ? 'Error al registrar la conformidad. Intenta nuevamente'
                    : 'Error al registrar la observación. Intenta nuevamente');
            }
        }, 1000);
    };

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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrar Observaciones de Aforo</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {/* Feedback último registro */}
            {ultimoResultado && (
                <div className={`p-4 rounded-xl border mb-6 text-sm font-semibold ${
                    ultimoResultado === 'levante'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                    {ultimoResultado === 'levante'
                        /* CA3: estado "Listo para Levante" */
                        ? 'Conformidad registrada. El despacho cambió a estado "Listo para Levante". El cliente fue notificado.'
                        /* CA2: estado "Observado" */
                        : 'Observación registrada. Estado del despacho: "Observado". El cliente fue notificado.'}
                </div>
            )}

            {/* Detalle HU17: conformidad final confirmada → no se admiten nuevas observaciones desde esta pantalla */}
            {conformidadFinal && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 mb-6">
                    La conformidad final fue registrada. No es posible agregar nuevas observaciones desde esta pantalla.
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">

                {/* CA3.1: campo de texto — deshabilitado cuando conformidad está marcada (y viceversa tras conformidad final) */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Observación
                    </label>
                    <textarea
                        value={observacion}
                        onChange={e => setObservacion(e.target.value.slice(0, MAX_CHARS))}
                        disabled={conformidad || conformidadFinal}
                        placeholder="Ingrese el detalle del requerimiento de SUNAT..."
                        rows={4}
                        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] resize-none ${
                            conformidad || conformidadFinal ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
                        }`}
                    />
                    {/* CA2.2: contador de caracteres — máximo 1000 */}
                    {!conformidad && !conformidadFinal && (
                        <p className="text-xs text-gray-400 text-right mt-1">{observacion.length}/{MAX_CHARS}</p>
                    )}
                </div>

                {/* CA3.1: casilla conformidad — mutuamente excluyente con el campo de texto (y viceversa) */}
                <label className={`flex items-center gap-3 mb-5 ${observacion.trim() !== '' || conformidadFinal ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <input
                        type="checkbox"
                        checked={conformidad}
                        onChange={handleConformidadChange}
                        disabled={observacion.trim() !== '' || conformidadFinal}
                        className="w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c] disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">Marcar conformidad y solicitar levante</span>
                </label>

                {/* CA2.1: aviso campo obligatorio */}
                {intentoRegistrar && !puedeRegistrar && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-4">
                        Debe ingresar una observación o marcar conformidad para continuar.
                    </div>
                )}

                {/* CA2.3 / CA3.2: MSG error de conexión */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                        {error}
                    </div>
                )}

                {/* CA2 + CA3: botón CONFIRMAR REGISTRO — siempre este texto */}
                <div className="flex justify-end">
                    <button
                        onClick={handleRegistrar}
                        disabled={procesando || conformidadFinal}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            !puedeRegistrar || procesando || conformidadFinal
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
                            'CONFIRMAR REGISTRO'
                        )}
                    </button>
                </div>
            </div>

            {/* Historial acumulativo — CA2, solo lectura */}
            {historial.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-700">Historial de observaciones</h2>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {historial.map(entrada => (
                            <li key={entrada.id} className="px-5 py-4">
                                <div className="flex items-center gap-2 mb-1">
                                    {entrada.esConformidad ? (
                                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Conformidad</span>
                                    ) : (
                                        <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Observación</span>
                                    )}
                                    <span className="text-xs text-gray-400">{entrada.fecha} {entrada.hora} · {entrada.usuario}</span>
                                </div>
                                <p className="text-sm text-gray-700">{entrada.texto}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
