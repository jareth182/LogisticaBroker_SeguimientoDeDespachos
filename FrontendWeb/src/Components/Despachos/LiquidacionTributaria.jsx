import { useState } from 'react';

const TIPO_CAMBIO = 3.72;
const MONEDA = 'Soles';

const CIF = 128450.00;
const AD_VALOREM = CIF * 0.06;
const IGV = (CIF + AD_VALOREM) * 0.16;
const IPM = (CIF + AD_VALOREM) * 0.02;

const TRIBUTOS_FAKE = {
    valorCIF: CIF,
    adValorem: AD_VALOREM,
    igv: IGV,
    ipm: IPM,
    percepcionSUNAT: (CIF + AD_VALOREM + IGV + IPM) * 0.035,
    tieneAjuste: true,
    motivoAjuste: 'Multa por subvaloración declarada — Resolución SUNAT N° 0342-2024',
    montoAjuste: 1850.00,
    fechaAjuste: '10/06/2026',
    estadoAjuste: 'Pendiente',
    calculado: true,
};

export default function LiquidacionTributaria({ despacho, onVolver, usuario }) {
    const [mostrarDetalleAjuste, setMostrarDetalleAjuste] = useState(false);
    const [errorDescarga, setErrorDescarga] = useState('');

    const datos = TRIBUTOS_FAKE;

    const fmt = (n) =>
        (n * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const total = datos.adValorem + datos.igv + datos.ipm + datos.percepcionSUNAT + (datos.tieneAjuste ? datos.montoAjuste : 0);

    // CA4: descarga PDF con desglose, moneda, tipo cambio, fecha generación y nombre usuario
    const handleDescargar = () => {
        setErrorDescarga('');
        try {
            const fechaGeneracion = new Date().toLocaleString('es-PE');
            const contenido = [
                'RESUMEN TRIBUTARIO',
                `Despacho: ${despacho?.codigoBl ?? 'BL-2024-001'}`,
                `Generado por: ${usuario?.nombreCompleto ?? 'Usuario'}`,
                `Fecha de generación: ${fechaGeneracion}`,
                `Tipo de cambio: S/ ${TIPO_CAMBIO}`,
                `Moneda: ${MONEDA}`,
                '',
                `Ad Valorem (6%): S/ ${fmt(datos.adValorem)}`,
                `IGV (16%): S/ ${fmt(datos.igv)}`,
                `IPM (2%): S/ ${fmt(datos.ipm)}`,
                `Percepción SUNAT (3.5%): S/ ${fmt(datos.percepcionSUNAT)}`,
                datos.tieneAjuste ? `Ajuste / Multa SUNAT: S/ ${fmt(datos.montoAjuste)}` : null,
                `Total a Pagar: S/ ${fmt(total)}`,
            ].filter(Boolean).join('\n');
            const blob = new Blob([contenido], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resumen_tributario_${despacho?.codigoBl ?? 'despacho'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // CA4.1: error al generar PDF
            setErrorDescarga('Error al generar el resumen tributario. Intenta nuevamente');
        }
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

            {/* CA1.1: despacho sin borrador DAM generado — MSG exacto del CA */}
            {!datos.calculado && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-6">
                    La liquidación tributaria aún no ha sido calculada. Genera el borrador DAM para continuar.
                </div>
            )}

            {/* CA2: ajuste resaltado + botón VER DETALLE DE AJUSTE habilitado */}
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
                    <button
                        onClick={() => setMostrarDetalleAjuste(v => !v)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        VER DETALLE DE AJUSTE
                    </button>
                </div>
            )}

            {/* CA3: panel con motivo del cargo, monto exacto, fecha emisión SUNAT, estado del ajuste */}
            {mostrarDetalleAjuste && datos.tieneAjuste && (
                <div className="p-5 bg-white border border-orange-200 rounded-xl mb-6">
                    <p className="text-sm font-bold text-gray-800 mb-4">Detalle del ajuste SUNAT</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Motivo del cargo</p>
                            <p className="text-gray-800">{datos.motivoAjuste}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Monto exacto</p>
                            <p className="text-gray-800 font-bold">S/ {fmt(datos.montoAjuste)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Fecha de emisión SUNAT</p>
                            <p className="text-gray-800">{datos.fechaAjuste}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Estado del ajuste</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                datos.estadoAjuste === 'Pendiente'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {datos.estadoAjuste}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* CA1: tabla desglose tributos — solo lectura */}
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

            {/* CA4.1: error al generar resumen */}
            {errorDescarga && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {errorDescarga}
                </div>
            )}

            {/* CA4: botón DESCARGAR RESUMEN TRIBUTARIO */}
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
