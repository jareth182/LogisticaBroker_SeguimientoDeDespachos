import { useState } from 'react';

// Datos simulados del despacho
const TIPO_CAMBIO = 3.72;
const MONEDA = 'Soles';

const TRIBUTOS_FAKE = {
    valorCIF: 128450.00,
    adValorem: 128450.00 * 0.06,
    igv: (128450.00 + 128450.00 * 0.06) * 0.16,
    ipm: (128450.00 + 128450.00 * 0.06) * 0.02,
    percepcionSUNAT: 128450.00 * 0.035,
    tieneAjuste: true,
    motivoAjuste: 'Multa por subvaloración declarada — Resolución SUNAT N° 0342-2024',
    montoAjuste: 1850.00,
    calculado: true,
};

export default function LiquidacionTributaria({ despacho, onVolver, usuario }) {
    const [mostrarDetalleAjuste, setMostrarDetalleAjuste] = useState(false);

    const esCliente = usuario?.rol === 'Cliente';
    const datos = TRIBUTOS_FAKE;

    const fmt = (n) =>
        (n * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const total = datos.adValorem + datos.igv + datos.ipm + datos.percepcionSUNAT + (datos.tieneAjuste ? datos.montoAjuste : 0);

    const handleDescargar = () => {
        // CA3: simular descarga de PDF
        const contenido = [
            'RESUMEN TRIBUTARIO',
            `Despacho: ${despacho?.codigoBl ?? 'BL-2024-001'}`,
            `Tipo de cambio: S/ ${TIPO_CAMBIO}`,
            `Moneda: ${MONEDA}`,
            '',
            `Ad Valorem: S/ ${fmt(datos.adValorem)}`,
            `IGV: S/ ${fmt(datos.igv)}`,
            `IPM: S/ ${fmt(datos.ipm)}`,
            `Percepción SUNAT: S/ ${fmt(datos.percepcionSUNAT)}`,
            datos.tieneAjuste ? `Ajuste/Multa: S/ ${fmt(datos.montoAjuste)}` : '',
            `Total a Pagar: S/ ${fmt(total)}`,
        ].join('\n');
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumen_tributario_${despacho?.codigoBl ?? 'despacho'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Liquidación Tributaria</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
                &nbsp;· Moneda: <span className="font-semibold">{MONEDA}</span>
                &nbsp;· Tipo de cambio: <span className="font-semibold">S/ {TIPO_CAMBIO}</span>
            </p>

            {/* CA1: si no hay tributos calculados */}
            {!datos.calculado && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-6">
                    La liquidación está pendiente. Aún no se han calculado los tributos para este despacho.
                </div>
            )}

            {/* CA2: etiqueta advertencia ajuste */}
            {datos.calculado && datos.tieneAjuste && (
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-300 rounded-xl mb-6">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-bold text-orange-800">Ajuste / Multa SUNAT</p>
                            <p className="text-xs text-orange-700">Monto adicional: S/ {fmt(datos.montoAjuste)}</p>
                        </div>
                    </div>
                    {/* CA2: botón VER DETALLE DE AJUSTE */}
                    <button
                        onClick={() => setMostrarDetalleAjuste(v => !v)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        VER DETALLE DE AJUSTE
                    </button>
                </div>
            )}

            {/* Panel detalle ajuste */}
            {mostrarDetalleAjuste && datos.tieneAjuste && (
                <div className="p-4 bg-white border border-orange-200 rounded-xl mb-6 text-sm text-gray-700">
                    <p className="font-semibold text-gray-800 mb-1">Motivo del cargo extra:</p>
                    <p>{datos.motivoAjuste}</p>
                </div>
            )}

            {/* CA1: tabla de desglose — solo lectura */}
            {datos.calculado && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-700">Desglose de Tributos</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                                <th className="px-5 py-3">Concepto</th>
                                <th className="px-5 py-3 text-right">Tasa</th>
                                <th className="px-5 py-3 text-right">Monto ({MONEDA})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <tr>
                                <td className="px-5 py-3 text-gray-700">Ad Valorem</td>
                                <td className="px-5 py-3 text-right text-gray-600">6%</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmt(datos.adValorem)}</td>
                            </tr>
                            <tr>
                                <td className="px-5 py-3 text-gray-700">IGV</td>
                                <td className="px-5 py-3 text-right text-gray-600">16%</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmt(datos.igv)}</td>
                            </tr>
                            <tr>
                                <td className="px-5 py-3 text-gray-700">IPM</td>
                                <td className="px-5 py-3 text-right text-gray-600">2%</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmt(datos.ipm)}</td>
                            </tr>
                            <tr>
                                <td className="px-5 py-3 text-gray-700">Percepción SUNAT</td>
                                <td className="px-5 py-3 text-right text-gray-600">3.5%</td>
                                <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmt(datos.percepcionSUNAT)}</td>
                            </tr>
                            {datos.tieneAjuste && (
                                <tr className="bg-orange-50">
                                    <td className="px-5 py-3 text-orange-700 font-medium">Ajuste / Multa SUNAT</td>
                                    <td className="px-5 py-3 text-right text-orange-600">—</td>
                                    <td className="px-5 py-3 text-right font-semibold text-orange-800">S/ {fmt(datos.montoAjuste)}</td>
                                </tr>
                            )}
                            <tr className="bg-[#f0fbfc] font-bold">
                                <td className="px-5 py-3 text-[#1a2540]" colSpan={2}>Total a Pagar</td>
                                <td className="px-5 py-3 text-right text-[#1a2540] text-base">S/ {fmt(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* CA3: botón DESCARGAR RESUMEN TRIBUTARIO — siempre habilitado */}
            <div className="flex justify-end">
                <button
                    onClick={handleDescargar}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    DESCARGAR RESUMEN TRIBUTARIO
                </button>
            </div>
        </div>
    );
}
