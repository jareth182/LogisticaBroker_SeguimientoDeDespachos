import { useState } from 'react';

const API_DAM = 'http://localhost:5018/api/DAM';

export default function BorradorDAMFinal({ despacho, onVolver, onGenerado }) {
    const [confirmado, setConfirmado] = useState(false);
    const [generando, setGenerando]   = useState(false);
    const [resultado, setResultado]   = useState(null);
    const [error, setError]           = useState(null);

    const handleGenerar = async () => {
        if (!confirmado) return; // botón deshabilitado si no se marcó el checkbox de confirmación
        setGenerando(true); setError(null);
        try {
            const res = await fetch(`${API_DAM}/${despacho.idDespacho}/confirmar-borrador`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) { // PA HU12-1 OK — estado → "Borrador Finalizado", PDF disponible
                setResultado(data);
                onGenerado?.(data.estado);
            } else {
                // PA HU12-1.1 NOK — ítems sin partida arancelaria
                // PA HU12-1.2 NOK — fallo al generar PDF
                // PA HU12-1.4 NOK — borrador ya generado previamente
                setError(data.mensaje || 'No se pudo generar el borrador. Verifique su conexión e intente nuevamente.');
            }
        } catch { // PA HU12-1.3 NOK — error de conexión durante el procesamiento
            setError('No se pudo generar el borrador. Verifique su conexión e intente nuevamente.');
        } finally { setGenerando(false); }
    };

    const handleImprimir = () => {
        window.print();
    };

    if (resultado) {
        return (
            <div className="max-w-4xl mx-auto">
                {/* Banner éxito */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-800">¡Borrador DAM generado exitosamente!</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            El estado del despacho cambió a <span className="font-bold">Borrador Finalizado</span>.
                            El documento está disponible para descarga por el equipo de revisión técnica.
                        </p>
                    </div>
                </div>

                {/* Documento imprimible */}
                <div id="dam-pdf" className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 print:shadow-none print:border-none">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-[#1a2540]">BORRADOR DAM — DECLARACIÓN ADUANERA DE MERCANCÍAS</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {despacho.codigoOrden} · BL: {despacho.codigoBl} · {despacho.razonSocial}
                        </p>
                        <p className="text-xs text-gray-400">Generado: {new Date().toLocaleString('es-PE')}</p>
                    </div>

                    {/* Resumen financiero */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#f0fbfc] border border-[#b2ebf2] rounded-xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Total Ítems Procesados</p>
                            <p className="text-3xl font-bold text-[#1a2540]">{resultado.totalItems}</p>
                            <p className="text-xs text-[#008b9c] mt-1">✓ 100% Clasificados</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Peso Bruto Total</p>
                            <p className="text-3xl font-bold text-[#1a2540]">
                                {Number(resultado.pesoBrutoTotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })} kg
                            </p>
                            <p className="text-xs text-gray-400 mt-1">B/L: {despacho.codigoBl}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Valor CIF Total</p>
                            <p className="text-3xl font-bold text-[#1a2540]">
                                ${Number(resultado.valorCifTotal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Tributos */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Desglose de Tributos Estimados</h3>
                        </div>
                        <table className="w-full text-sm text-left border border-gray-100 rounded-xl overflow-hidden">
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
                                    <td className="px-5 py-3 text-right text-gray-600">${Number(resultado.valorCifTotal).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right text-gray-600">6%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">${Number(resultado.tributos.adValorem).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 text-gray-700 font-medium">IGV</td>
                                    <td className="px-5 py-3 text-right text-gray-600">${(Number(resultado.valorCifTotal) + Number(resultado.tributos.adValorem)).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right text-gray-600">16%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">${Number(resultado.tributos.igv).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-3 text-gray-700 font-medium">IPM</td>
                                    <td className="px-5 py-3 text-right text-gray-600">${(Number(resultado.valorCifTotal) + Number(resultado.tributos.adValorem)).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right text-gray-600">2%</td>
                                    <td className="px-5 py-3 text-right font-semibold text-gray-800">${Number(resultado.tributos.ipm).toFixed(2)}</td>
                                </tr>
                                <tr className="bg-[#f0fbfc] font-bold">
                                    <td className="px-5 py-3 text-[#1a2540]" colSpan={3}>Total Estimado</td>
                                    <td className="px-5 py-3 text-right text-[#1a2540] text-base">${Number(resultado.tributos.total).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Ítems */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Ítems Declarados</h3>
                        <table className="w-full text-xs text-left border border-gray-100 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Descripción</th>
                                    <th className="px-4 py-2">Partida</th>
                                    <th className="px-4 py-2 text-right">Cant.</th>
                                    <th className="px-4 py-2 text-right">Valor USD</th>
                                    <th className="px-4 py-2 text-right">Peso kg</th>
                                    <th className="px-4 py-2 text-center">Restricción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {resultado.items.map((it, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                                        <td className="px-4 py-2 text-gray-800 font-medium max-w-[200px] truncate">{it.descripcion}</td>
                                        <td className="px-4 py-2 font-mono text-gray-700">{it.partidaArancelaria}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">{it.cantidad}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">${Number(it.valor).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">{it.peso}</td>
                                        <td className="px-4 py-2 text-center">
                                            {it.tieneRestriccion
                                                ? <span className="text-orange-500">⚠</span>
                                                : <span className="text-gray-300">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleImprimir}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Descargar / Imprimir PDF
                    </button>
                    <button onClick={onVolver} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Volver a Despachos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Logística Broker Perú S.A.C.</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Generar Borrador DAM</span>
            </div>

            <div className="flex items-center justify-between mb-5">
                <div>
                    <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-2 hover:text-[#008b9c] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Volver a Operaciones
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Generar Borrador DAM</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Revise los totales financieros antes de generar el borrador de la Declaración Aduanera de Mercancías (DAM).
                    </p>
                </div>
            </div>

            {/* Info despacho */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-gray-400">Despacho</p>
                        <p className="font-bold text-gray-800">{despacho.codigoOrden}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Importador</p>
                        <p className="font-semibold text-gray-700">{despacho.razonSocial}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">BL</p>
                        <p className="font-mono text-gray-600">{despacho.codigoBl}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Estado actual</p>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            {despacho.estado}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {/* Card confirmación */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-blue-700">
                        Al generar el borrador, el sistema verificará que <strong>todos los ítems de la factura tengan partida arancelaria</strong> asignada y calculará los tributos estimados. El estado del despacho cambiará a <strong>"Borrador Finalizado"</strong>.
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={confirmado}
                            onChange={e => setConfirmado(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c]"
                        />
                        <span className="text-sm text-gray-700">
                            Confirmo que los datos resumidos son correctos.
                        </span>
                    </label>
                    <p className="text-xs text-gray-400 ml-7">
                        La generación del borrador congelará estos valores para la revisión pre-transmisión a SUNAT.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleGenerar}
                        disabled={!confirmado || generando}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors ${
                            !confirmado || generando
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
