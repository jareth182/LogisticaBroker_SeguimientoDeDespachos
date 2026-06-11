import { useState } from 'react';

// Mock: el despacho puede tener observaciones de aforo aún pendientes (CA2)
const TIENE_OBSERVACIONES_PENDIENTES = false;

const ESTADOS = ['Verificación Documentaria Final', 'Levante Autorizado'];

export default function RegistrarLevante({ despacho, onVolver, usuario }) {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');
    const [bloqueoObservaciones, setBloqueoObservaciones] = useState('');

    const observacionesPendientes = TIENE_OBSERVACIONES_PENDIENTES;

    const handleEstadoChange = (e) => {
        const valor = e.target.value;
        setEstadoSeleccionado(valor);
        setError('');
        // CA2: bloquear el cambio a "Levante Autorizado" si hay observaciones pendientes
        if (valor === 'Levante Autorizado' && observacionesPendientes) {
            setBloqueoObservaciones('No es posible autorizar el levante. El despacho tiene observaciones de aforo pendientes; resuelve las incidencias técnicas antes de continuar.');
        } else {
            setBloqueoObservaciones('');
        }
    };

    // CA2: solo se habilita confirmar cuando hay un estado válido y no hay bloqueo por observaciones
    const puedeConfirmar = estadoSeleccionado !== '' && !bloqueoObservaciones;

    // CA1: confirmar levante → actualiza expediente + notifica al cliente y al Jefe de Operaciones
    const handleConfirmar = () => {
        if (!puedeConfirmar || procesando) return;
        setProcesando(true);
        setError('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setResultado({
                    estado: estadoSeleccionado,
                    usuario: usuario?.nombreCompleto ?? 'Despachador de Aduanas',
                    fecha: new Date().toLocaleString('es-PE'),
                });
            } catch {
                setProcesando(false);
                setError('Error al registrar el levante. Intenta nuevamente');
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
                        <p className="text-base font-bold text-green-800">Levante registrado correctamente.</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            El expediente se actualizó a "{resultado.estado}". Se notificó automáticamente al cliente y al Jefe de Operaciones.
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Registrado por: <span className="font-semibold">{resultado.usuario}</span> · {resultado.fecha}
                        </p>
                        {/* Detalle HU18: el módulo SUNAT queda bloqueado para ediciones posteriores */}
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            El módulo aduanero SUNAT quedó bloqueado para ediciones posteriores.
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrar Levante de Mercancía</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
                {/* Selector de estado */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Estado del despacho <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={estadoSeleccionado}
                        onChange={handleEstadoChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]"
                    >
                        <option value="">Seleccionar estado...</option>
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>

                {/* CA2: bloqueo por observaciones pendientes de aforo */}
                {bloqueoObservaciones && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4 flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        {bloqueoObservaciones}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                        {error}
                    </div>
                )}

                {/* CA1: botón CONFIRMAR LEVANTE */}
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirmar}
                        disabled={procesando}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            !puedeConfirmar || procesando
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
                            'CONFIRMAR LEVANTE'
                        )}
                    </button>
                </div>
            </div>

            {/* Aviso de criticidad — Detalle HU18 */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Acción crítica: una vez registrado el levante, el módulo aduanero SUNAT se bloquea para ediciones posteriores.
            </div>
        </div>
    );
}
