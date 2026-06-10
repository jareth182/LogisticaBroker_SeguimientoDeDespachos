import { useState } from 'react';

export default function RegistrarObservacionesAforo({ despacho, onVolver, usuario }) {
    const [observacion, setObservacion] = useState('');
    const [conformidad, setConformidad] = useState(false);
    const [intentoRegistrar, setIntentoRegistrar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [ultimoResultado, setUltimoResultado] = useState(null);

    // CA2: habilitado si hay texto en observación O casilla marcada
    const puedeRegistrar = observacion.trim() !== '' || conformidad;

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

        setTimeout(() => {
            const entrada = {
                id: Date.now(),
                texto: conformidad ? 'Revisión conforme — Se solicita levante.' : observacion,
                esConformidad: conformidad,
                fecha: new Date().toLocaleDateString('es-PE'),
                hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                usuario: usuario?.nombreCompleto ?? 'Despachador',
            };
            // CA1 / CA3: acumular historial
            setHistorial(prev => [...prev, entrada]);
            setUltimoResultado(conformidad ? 'levante' : 'observado');
            setObservacion('');
            setConformidad(false);
            setIntentoRegistrar(false);
            setProcesando(false);
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
                        ? 'Conformidad registrada. El despacho quedó habilitado para Levante. El cliente fue notificado.'
                        : 'Observación registrada. Estado del despacho: "Observado". El cliente fue notificado.'}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">

                {/* CA3: campo de texto — deshabilitado cuando conformidad está marcada */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Observación
                    </label>
                    <textarea
                        value={observacion}
                        onChange={e => setObservacion(e.target.value)}
                        disabled={conformidad}
                        placeholder="Ingrese el detalle del requerimiento de SUNAT..."
                        rows={4}
                        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] resize-none ${
                            conformidad ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
                        }`}
                    />
                </div>

                {/* CA3: casilla Marcar conformidad */}
                <label className="flex items-center gap-3 cursor-pointer mb-5">
                    <input
                        type="checkbox"
                        checked={conformidad}
                        onChange={handleConformidadChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c]"
                    />
                    <span className="text-sm text-gray-700">Marcar conformidad y solicitar levante</span>
                </label>

                {/* CA2: aviso campo obligatorio */}
                {intentoRegistrar && !puedeRegistrar && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-4">
                        Debe ingresar una observación o marcar conformidad para continuar.
                    </div>
                )}

                {/* CA1 + CA3: botón REGISTRAR OBSERVACIÓN */}
                <div className="flex justify-end">
                    <button
                        onClick={handleRegistrar}
                        disabled={procesando}
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
                            'REGISTRAR OBSERVACIÓN'
                        )}
                    </button>
                </div>
            </div>

            {/* Historial acumulativo — CA1, solo lectura */}
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
