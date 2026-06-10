import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function BorradorDAMFinal({ despacho, onVolver, onGenerado }) {
    const [confirmado, setConfirmado] = useState(false);
    const [generando, setGenerando]   = useState(false);
    const [generado, setGenerado]     = useState(despacho.estado === 'Borrador Finalizado');
    const [error, setError]           = useState(null);
    const [errorExportar, setErrorExportar] = useState(null);

    // Valores simulados — en producción vendrían del despacho
    const totalItems   = despacho.totalItems   ?? 12;
    const pesoBruto    = despacho.pesoBruto    ?? 3840.50;
    const valorCIF     = despacho.valorCIF     ?? 128450.00;
    const valorFOB     = despacho.valorFOB     ?? 121000.00;
    const flete        = despacho.flete        ?? 5500.00;
    const seguro       = despacho.seguro       ?? 1950.00;

    // Cálculo de tributos — CA1
    const adValorem = valorCIF * 0.06;
    const igv       = (valorCIF + adValorem) * 0.16;
    const ipm       = (valorCIF + adValorem) * 0.02;
    const total     = adValorem + igv + ipm;

    const fmt = (n) => n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const yaGenerado = despacho.estado === 'Borrador Finalizado';

    const handleGenerar = () => {
        if (!confirmado || yaGenerado) return;
        setGenerando(true); setError(null);
        setTimeout(() => {
            try {
                setGenerado(true);
                setGenerando(false);
                onGenerado?.('Borrador Finalizado');
            } catch {
                setError('Error al generar el borrador. Intenta nuevamente');
                setGenerando(false);
            }
        }, 1200);
    };

    // Exportar tributos a Excel — CA3
    const handleExportar = () => {
        setErrorExportar(null);
        try {
            const ws = XLSX.utils.json_to_sheet([
                { Concepto: 'Ad Valorem', 'Base Imponible (USD)': fmt(valorCIF),             Tasa: '6%',  'Total a Pagar (USD)': fmt(adValorem) },
                { Concepto: 'IGV',        'Base Imponible (USD)': fmt(valorCIF + adValorem), Tasa: '16%', 'Total a Pagar (USD)': fmt(igv) },
                { Concepto: 'IPM',        'Base Imponible (USD)': fmt(valorCIF + adValorem), Tasa: '2%',  'Total a Pagar (USD)': fmt(ipm) },
                { Concepto: 'Total Estimado', 'Base Imponible (USD)': '',                    Tasa: '',    'Total a Pagar (USD)': fmt(total) },
            ]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Tributos');
            XLSX.writeFile(wb, `tributos_${despacho.codigoOrden}.xlsx`);
        } catch {
            setErrorExportar('Error al exportar los tributos. Intenta nuevamente');
        }
    };

    if (generado) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-800">¡Borrador generado con éxito!</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            El estado del despacho cambió a <span className="font-bold">Borrador Finalizado</span>.
                        </p>
                    </div>
                </div>
                <button onClick={onVolver} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                    Volver a Despachos
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Enlace volver — siempre habilitado */}
            <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                ← Volver a Operaciones
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Generar Borrador DAM</h1>
            <p className="text-sm text-gray-500 mb-6">
                Revise los totales financieros antes de generar el borrador de la Declaración Aduanera de Mercancías (DAM).
            </p>

            {/* CA2.3: borrador ya generado */}
            {yaGenerado && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-4">
                    El borrador ya fue generado para este despacho
                </div>
            )}

            {/* Error generar — CA2.2 */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {/* 3 Tarjetas resumen — CA1 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Ítems Procesados</p>
                    <p className="text-4xl font-bold text-[#1a2540]">{totalItems}</p>
                    <p className="text-xs text-green-600 font-semibold mt-2">✓ 100% Clasificados</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Peso Bruto Total</p>
                    <p className="text-4xl font-bold text-[#1a2540]">{fmt(pesoBruto)}</p>
                    <p className="text-xs text-gray-400 mt-2">kg · B/L: {despacho.codigoBl}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Valor CIF Total</p>
                    <p className="text-4xl font-bold text-[#1a2540]">${fmt(valorCIF)}</p>
                    <p className="text-xs text-gray-400 mt-2">FOB ${fmt(valorFOB)} · Flete ${fmt(flete)} · Seg. ${fmt(seguro)}</p>
                </div>
            </div>

            {/* Desglose de Tributos Estimados — CA1 + CA3 */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-700">Desglose de Tributos Estimados</h2>
                    {/* Botón Exportar — CA3 */}
                    <button
                        onClick={handleExportar}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[#008b9c] hover:text-[#007685] border border-[#008b9c] px-3 py-1.5 rounded-lg hover:bg-[#e0f7fa] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Exportar
                    </button>
                </div>
                {/* CA3.1: error exportar */}
                {errorExportar && (
                    <div className="px-5 pb-3 text-sm text-red-700">
                        {errorExportar}
                    </div>
                )}
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                            <th className="px-5 py-3">Concepto</th>
                            <th className="px-5 py-3 text-right">Base Imponible (USD)</th>
                            <th className="px-5 py-3 text-right">Tasa</th>
                            <th className="px-5 py-3 text-right">Total a Pagar (USD)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <tr>
                            <td className="px-5 py-3 text-gray-700 font-medium">Ad Valorem</td>
                            <td className="px-5 py-3 text-right text-gray-600">${fmt(valorCIF)}</td>
                            <td className="px-5 py-3 text-right text-gray-600">6%</td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-800">${fmt(adValorem)}</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-3 text-gray-700 font-medium">IGV</td>
                            <td className="px-5 py-3 text-right text-gray-600">${fmt(valorCIF + adValorem)}</td>
                            <td className="px-5 py-3 text-right text-gray-600">16%</td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-800">${fmt(igv)}</td>
                        </tr>
                        <tr>
                            <td className="px-5 py-3 text-gray-700 font-medium">IPM</td>
                            <td className="px-5 py-3 text-right text-gray-600">${fmt(valorCIF + adValorem)}</td>
                            <td className="px-5 py-3 text-right text-gray-600">2%</td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-800">${fmt(ipm)}</td>
                        </tr>
                        <tr className="bg-[#f0fbfc] font-bold">
                            <td className="px-5 py-3 text-[#1a2540]" colSpan={3}>Total Estimado</td>
                            <td className="px-5 py-3 text-right text-[#1a2540] text-base">${fmt(total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Checkbox y botón — CA2 */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <label className="flex items-start gap-3 cursor-pointer mb-5">
                    <input
                        type="checkbox"
                        checked={confirmado}
                        onChange={e => setConfirmado(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c]"
                    />
                    <span className="text-sm text-gray-700">
                        Confirmo que los datos resumidos son correctos. La generación del borrador congelará estos valores para la revisión pre-transmisión a SUNAT.
                    </span>
                </label>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerar}
                        disabled={!confirmado || generando || yaGenerado}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors ${
                            !confirmado || generando || yaGenerado
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-[#008b9c] text-white hover:bg-[#007685] shadow-sm'
                        }`}
                    >
                        {generando ? (
                            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Generando...</>
                        ) : (
                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Generar Borrador</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
