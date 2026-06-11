import { useState } from 'react';

const COMPROBANTE_FAKE = {
    nombre: 'comprobante_pago_BL2024001.pdf',
    url: null,
    fechaSubida: '2026-06-10 09:32',
    cliente: 'Importaciones XYZ S.A.C.',
};

export default function ValidarComprobantes({ despacho, onVolver, usuario }) {
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [errorAprobar, setErrorAprobar] = useState('');
    const [errorRechazar, setErrorRechazar] = useState('');

    const ahora = () => new Date().toLocaleString('es-PE');

    // CA2: aprobar comprobante → estado "Tributos Cancelados" + registro auditoría
    const handleAprobar = () => {
        if (procesando) return;
        setProcesando(true);
        setErrorAprobar('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setResultado({
                    tipo: 'aprobado',
                    mensaje: 'El estado del despacho cambió a "Tributos Cancelados". Se habilitó la etapa de numeración.',
                    usuario: usuario?.nombreCompleto ?? 'Administrador',
                    fecha: ahora(),
                });
            } catch {
                // CA2.1: error de conexión al aprobar
                setProcesando(false);
                setErrorAprobar('Error al aprobar el comprobante. Intenta nuevamente');
            }
        }, 1000);
    };

    // CA3: rechazar con motivo → estado "Pendiente de Pago" + notifica cliente + registro auditoría
    const handleRechazar = () => {
        if (!motivoRechazo.trim() || procesando) return;
        setProcesando(true);
        setErrorRechazar('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setResultado({
                    tipo: 'rechazado',
                    mensaje: 'El cliente fue notificado para que vuelva a subir el documento correcto. El estado regresó a "Pendiente de Pago".',
                    usuario: usuario?.nombreCompleto ?? 'Administrador',
                    fecha: ahora(),
                    motivo: motivoRechazo,
                });
            } catch {
                // CA3.3: error de conexión al rechazar
                setProcesando(false);
                setErrorRechazar('Error al registrar el rechazo. Intenta nuevamente');
            }
        }, 1000);
    };

    if (resultado) {
        const esAprobado = resultado.tipo === 'aprobado';
        return (
            <div className="max-w-3xl mx-auto">
                <div className={`border rounded-xl p-6 flex items-start gap-4 ${esAprobado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${esAprobado ? 'bg-green-100' : 'bg-red-100'}`}>
                        <svg className={`w-6 h-6 ${esAprobado ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {esAprobado
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            }
                        </svg>
                    </div>
                    <div>
                        <p className={`text-base font-bold ${esAprobado ? 'text-green-800' : 'text-red-800'}`}>
                            {esAprobado ? 'Comprobante aprobado' : 'Comprobante rechazado'}
                        </p>
                        <p className={`text-sm mt-0.5 ${esAprobado ? 'text-green-600' : 'text-red-600'}`}>{resultado.mensaje}</p>
                        {/* CA2 / CA3: registro auditoría — usuario + fecha + hora */}
                        <p className="text-xs text-gray-500 mt-2">
                            Registrado por: <span className="font-semibold">{resultado.usuario}</span> · {resultado.fecha}
                        </p>
                        {resultado.motivo && (
                            <p className="text-xs text-gray-500 mt-1">Motivo: {resultado.motivo}</p>
                        )}
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Validar Comprobante de Pago</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {/* CA1: visor comprobante — solo lectura */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 p-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Comprobante adjunto</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <svg className="w-8 h-8 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{COMPROBANTE_FAKE.nombre}</p>
                        <p className="text-xs text-gray-500">Subido el {COMPROBANTE_FAKE.fechaSubida} · {COMPROBANTE_FAKE.cliente}</p>
                    </div>
                    <a
                        href={COMPROBANTE_FAKE.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs font-semibold text-[#008b9c] hover:underline shrink-0"
                    >
                        Previsualizar
                    </a>
                </div>
            </div>

            {/* CA2: botón APROBAR COMPROBANTE */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Aprobar comprobante</p>
                {/* CA2.1: MSG error conexión */}
                {errorAprobar && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
                        {errorAprobar}
                    </div>
                )}
                <button
                    onClick={handleAprobar}
                    disabled={procesando}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                        procesando
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                    }`}
                >
                    APROBAR COMPROBANTE
                </button>
            </div>

            {/* CA3 + CA3.1 + CA3.2 + CA3.3: rechazo con motivo obligatorio */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Rechazar comprobante</p>

                {/* CA3.2: campo motivo con límite 500 chars + contador */}
                <textarea
                    value={motivoRechazo}
                    onChange={e => setMotivoRechazo(e.target.value.slice(0, 500))}
                    placeholder="Ingrese el motivo del rechazo..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] resize-none mb-1"
                />
                <p className="text-xs text-gray-400 text-right mb-3">{motivoRechazo.length}/500</p>

                {/* CA3.3: MSG error conexión */}
                {errorRechazar && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
                        {errorRechazar}
                    </div>
                )}

                {/* CA3.1: botón verdaderamente disabled cuando motivo vacío */}
                <button
                    onClick={handleRechazar}
                    disabled={!motivoRechazo.trim() || procesando}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                        !motivoRechazo.trim() || procesando
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    RECHAZAR POR INCONSISTENCIAS
                </button>
            </div>
        </div>
    );
}
