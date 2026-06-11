import { useState } from 'react';

// Conceptos consolidados del despacho: tributos, operativos y honorarios
const CONCEPTOS = [
    { grupo: 'Tributos', detalle: 'Ad Valorem, IGV e IPM (SUNAT)', monto: 21340.50 },
    { grupo: 'Tributos', detalle: 'Percepción SUNAT', monto: 5012.30 },
    { grupo: 'Gastos operativos', detalle: 'Almacenaje portuario', monto: 1850.00 },
    { grupo: 'Gastos operativos', detalle: 'Agenciamiento de carga', monto: 1200.00 },
    { grupo: 'Gastos operativos', detalle: 'Transporte terrestre', monto: 950.00 },
    { grupo: 'Honorarios', detalle: 'Honorarios de agencia de aduanas', monto: 2400.00 },
];

export default function GenerarLiquidacionFinal({ despacho, onVolver, usuario }) {
    const [generada, setGenerada] = useState(false);
    const [aprobada, setAprobada] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState('');

    const fmt = (n) => n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const total = CONCEPTOS.reduce((s, c) => s + c.monto, 0);

    // CA1: agrupar comprobantes y pagos asociados al despacho
    const grupos = ['Tributos', 'Gastos operativos', 'Honorarios'].map(g => ({
        nombre: g,
        items: CONCEPTOS.filter(c => c.grupo === g),
        subtotal: CONCEPTOS.filter(c => c.grupo === g).reduce((s, c) => s + c.monto, 0),
    }));

    // CA1: generar factura → consolida y calcula saldo total pendiente de facturación
    const handleGenerar = () => {
        if (procesando) return;
        setProcesando(true);
        setError('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setGenerada(true);
            } catch {
                setProcesando(false);
                setError('Error al generar la factura. Intenta nuevamente');
            }
        }, 1000);
    };

    // CA2: aprobar → notifica al cliente que su Liquidación Final de Gastos está disponible
    const handleAprobar = () => {
        if (procesando) return;
        setProcesando(true);
        setError('');
        setTimeout(() => {
            try {
                setProcesando(false);
                setAprobada(true);
            } catch {
                setProcesando(false);
                setError('Error al aprobar la liquidación. Intenta nuevamente');
            }
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={onVolver}
                className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                ← Volver
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Generar Liquidación Final</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">{error}</div>
            )}

            {/* CA2: aviso de aprobación + notificación al cliente */}
            {aprobada && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 mb-6">
                    <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="text-base font-bold text-green-800">Liquidación final aprobada.</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            Se notificó al cliente indicando que su Liquidación Final de Gastos está disponible en su panel.
                        </p>
                    </div>
                </div>
            )}

            {!generada ? (
                /* CA1: estado inicial — botón Generar Factura */
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-1">El ciclo operativo del despacho está finalizado.</p>
                    <p className="text-xs text-gray-400 mb-6">Consolida tributos, gastos operativos y honorarios para emitir la factura de cobro al cliente.</p>
                    <button
                        onClick={handleGenerar}
                        disabled={procesando}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            procesando ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                        }`}
                    >
                        {procesando ? 'Generando...' : 'Generar Factura'}
                    </button>
                </div>
            ) : (
                <>
                    {/* CA1/CA2: liquidación consolidada */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-bold text-gray-700">Liquidación Final de Gastos consolidada</h2>
                        </div>
                        {grupos.map(g => (
                            <div key={g.nombre}>
                                <div className="px-5 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                    <span>{g.nombre}</span>
                                    <span>S/ {fmt(g.subtotal)}</span>
                                </div>
                                {g.items.map((c, i) => (
                                    <div key={i} className="px-5 py-2.5 flex justify-between text-sm border-b border-gray-50">
                                        <span className="text-gray-600">{c.detalle}</span>
                                        <span className="font-semibold text-gray-800">S/ {fmt(c.monto)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                        {/* Saldo total pendiente de facturación */}
                        <div className="px-5 py-4 bg-[#f0fbfc] flex justify-between items-center">
                            <span className="text-sm font-bold text-[#1a2540]">Saldo total pendiente de facturación</span>
                            <span className="text-xl font-bold text-[#1a2540]">S/ {fmt(total)}</span>
                        </div>
                    </div>

                    {/* CA2: aprobar la liquidación */}
                    {!aprobada && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleAprobar}
                                disabled={procesando}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                                    procesando ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#008b9c] hover:bg-[#007685] text-white'
                                }`}
                            >
                                {procesando ? 'Aprobando...' : 'APROBAR LIQUIDACIÓN'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
