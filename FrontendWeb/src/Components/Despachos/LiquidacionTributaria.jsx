import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_ITEMS = 'http://localhost:5018/api/ItemsFactura';
const TIPO_CAMBIO = 3.40;
const MONEDA = 'Soles';

export default function LiquidacionTributaria({ despacho, onVolver, usuario, onAdjuntarComprobante }) {
    const [fob, setFob] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorDescarga, setErrorDescarga] = useState('');
    // PA HU13-1.2: error al cargar los montos tributarios
    const [errorCarga, setErrorCarga] = useState('');
    // PA HU13-3.1: error al cargar el detalle del ajuste
    const [errorDetalleAjuste, setErrorDetalleAjuste] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`${API_ITEMS}/${despacho.idDespacho}`);
                if (!res.ok) throw new Error();
                const items = await res.json();
                const total = items.reduce((s, it) => s + Number(it.cantidad || 0) * Number(it.valor || 0), 0);
                setFob(total);
            } catch {
                setFob(null);
            } finally {
                setCargando(false);
            }
        };
        fetchItems();
    }, [despacho.idDespacho]);

    const calculado = fob !== null && fob > 0;

    const adValorem     = calculado ? fob * 0.06 : 0;
    const igv           = calculado ? (fob + adValorem) * 0.16 : 0;
    const ipm           = calculado ? (fob + adValorem) * 0.02 : 0;
    const percepcion    = calculado ? (fob + adValorem + igv + ipm) * 0.035 : 0;
    const total         = adValorem + igv + ipm + percepcion;

    const fmtSoles = (usd) =>
        (usd * TIPO_CAMBIO).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const puedeAdjuntarComprobante = despacho?.estado === 'Pendiente de Pago';

    const handleDescargar = () => {
        setErrorDescarga('');
        try {
            const codigoDespacho = despacho?.codigoBl ?? despacho?.codigoOrden ?? '—';
            const fechaGeneracion = new Date().toLocaleString('es-PE');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Encabezado con franja de color
            doc.setFillColor(26, 37, 64);
            doc.rect(0, 0, 210, 28, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN TRIBUTARIO', 14, 13);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Logística Broker Perú S.A.C.', 14, 21);

            // Metadatos del despacho
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            const metaY = 36;
            doc.setFont('helvetica', 'bold');
            doc.text('Despacho:', 14, metaY);
            doc.setFont('helvetica', 'normal');
            doc.text(codigoDespacho, 40, metaY);

            doc.setFont('helvetica', 'bold');
            doc.text('Generado por:', 14, metaY + 6);
            doc.setFont('helvetica', 'normal');
            doc.text(usuario?.nombreCompleto ?? 'Usuario', 44, metaY + 6);

            doc.setFont('helvetica', 'bold');
            doc.text('Fecha:', 14, metaY + 12);
            doc.setFont('helvetica', 'normal');
            doc.text(fechaGeneracion, 30, metaY + 12);

            doc.setFont('helvetica', 'bold');
            doc.text('Tipo de cambio:', 110, metaY);
            doc.setFont('helvetica', 'normal');
            doc.text(`S/ ${TIPO_CAMBIO}`, 142, metaY);

            doc.setFont('helvetica', 'bold');
            doc.text('Moneda:', 110, metaY + 6);
            doc.setFont('helvetica', 'normal');
            doc.text(MONEDA, 127, metaY + 6);

            // Bloque Valor FOB
            doc.setFillColor(240, 251, 252);
            doc.setDrawColor(178, 235, 242);
            doc.roundedRect(14, metaY + 20, 182, 14, 2, 2, 'FD');
            doc.setTextColor(0, 139, 156);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('VALOR FOB (BASE DE CÁLCULO — BORRADOR DAM)', 19, metaY + 27);
            doc.setTextColor(26, 37, 64);
            doc.setFontSize(10);
            doc.text(
                `USD $ ${fob.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}   =   S/ ${fmtSoles(fob)}`,
                19, metaY + 33
            );

            // Tabla desglose
            autoTable(doc, {
                startY: metaY + 40,
                head: [['Concepto', 'Tasa', 'Monto (Soles)']],
                body: [
                    ['Ad Valorem', '6%', `S/ ${fmtSoles(adValorem)}`],
                    ['IGV', '16%', `S/ ${fmtSoles(igv)}`],
                    ['IPM', '2%', `S/ ${fmtSoles(ipm)}`],
                    ['Percepción SUNAT', '3.5%', `S/ ${fmtSoles(percepcion)}`],
                ],
                foot: [['Total a Pagar', '', `S/ ${fmtSoles(total)}`]],
                headStyles: { fillColor: [26, 37, 64], textColor: 255, fontStyle: 'bold', fontSize: 9 },
                footStyles: { fillColor: [240, 251, 252], textColor: [26, 37, 64], fontStyle: 'bold', fontSize: 10 },
                bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 30, halign: 'right', textColor: [0, 139, 156], fontStyle: 'bold' },
                    2: { cellWidth: 52, halign: 'right', fontStyle: 'bold' },
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 },
                showFoot: 'lastPage',
            });

            // Pie de página
            const pageH = doc.internal.pageSize.height;
            doc.setFontSize(7);
            doc.setTextColor(160, 160, 160);
            doc.text('Documento generado automáticamente por el sistema de Logística Broker Perú S.A.C.', 14, pageH - 8);

            doc.save(`resumen_tributario_${codigoDespacho}.pdf`);
        } catch {
            setErrorDescarga('Error al generar el resumen tributario. Intenta nuevamente.');
        }
    };

    // PA HU13-1.3: no muestra la sección si el rol no está autorizado
    if (sinPermiso) {
        return (
            <div className="max-w-4xl mx-auto">
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    ← Volver
                </button>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    No tienes permisos para acceder a esta sección
                </div>
            </div>
        );
    }

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

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Visualizar Montos Tributarios</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? despacho?.codigoOrden ?? '—'}</span>
                &nbsp;· Moneda: <span className="font-semibold">{MONEDA}</span>
                &nbsp;· Tipo de cambio: <span className="font-semibold">S/ {TIPO_CAMBIO}</span>
            </p>

            {cargando && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-10 justify-center">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Calculando tributos...
                </div>
            )}

            {!cargando && !calculado && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-6">
                    La liquidación tributaria aún no ha sido calculada. Genera el borrador DAM para continuar.
                </div>
            )}

            {!cargando && calculado && (
                <>
                    {/* Valor FOB de referencia */}
                    <div className="flex items-center gap-3 p-4 bg-[#f0fbfc] border border-[#b2ebf2] rounded-xl mb-6">
                        <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-[#008b9c] uppercase tracking-wide">Valor FOB (base de cálculo — Borrador DAM)</p>
                            <p className="text-sm font-bold text-[#1a2540]">
                                USD $ {fob.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                &nbsp;=&nbsp;
                                S/ {fmtSoles(fob)}
                            </p>
                        </div>
                    </div>

                    {/* Tabla desglose */}
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
                                    <td className="px-5 py-3 text-right text-[#008b9c] font-semibold">6%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmtSoles(adValorem)}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 text-gray-700">IGV</td>
                                    <td className="px-5 py-3 text-right text-[#008b9c] font-semibold">16%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmtSoles(igv)}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 text-gray-700">IPM</td>
                                    <td className="px-5 py-3 text-right text-gray-600">2%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmtSoles(ipm)}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 text-gray-700">Percepción SUNAT</td>
                                    <td className="px-5 py-3 text-right text-gray-600">3.5%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">S/ {fmtSoles(percepcion)}</td>
                                </tr>
                                <tr className="bg-[#f0fbfc] font-bold">
                                    <td className="px-5 py-3 text-[#1a2540]" colSpan={2}>Total a Pagar</td>
                                    <td className="px-5 py-3 text-right text-[#1a2540] text-base">S/ {fmtSoles(total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {errorDescarga && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                    {errorDescarga}
                </div>
            )}

            <div className="flex justify-end gap-3">
                {puedeAdjuntarComprobante && (
                    <button
                        onClick={() => onAdjuntarComprobante?.(despacho)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#008b9c] hover:bg-[#007685] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        ADJUNTAR COMPROBANTE
                    </button>
                )}
                <button
                    onClick={handleDescargar}
                    disabled={!calculado}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-colors shadow-sm ${
                        !calculado
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                    }`}
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
