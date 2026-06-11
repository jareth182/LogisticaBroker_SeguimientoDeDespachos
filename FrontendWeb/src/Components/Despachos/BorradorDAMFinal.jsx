import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_ITEMS    = 'http://localhost:5018/api/ItemsFactura';
const API_DESPACHO = 'http://localhost:5018/api/Despachos';

export default function BorradorDAMFinal({ despacho, onVolver, onGenerado }) {
    const [items, setItems]                   = useState([]);
    const [cargandoItems, setCargandoItems]   = useState(true);
    const [excelDescargado, setExcelDescargado] = useState(false);
    const [guardando, setGuardando]           = useState(false);
    const [generado, setGenerado]             = useState(despacho.estado === 'Borrador Finalizado');
    const [error, setError]                   = useState(null);
    const [errorExcel, setErrorExcel]         = useState(null);

    const valorCIF  = despacho.valorCIF  ?? 128450.00;
    const valorFOB  = despacho.valorFOB  ?? 121000.00;
    const flete     = despacho.flete     ?? 5500.00;
    const seguro    = despacho.seguro    ?? 1950.00;
    const adValorem = valorCIF * 0.06;
    const igv       = (valorCIF + adValorem) * 0.16;
    const ipm       = (valorCIF + adValorem) * 0.02;
    const total     = adValorem + igv + ipm;

    const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        fetch(`${API_ITEMS}/${despacho.idDespacho}`)
            .then(r => r.json())
            .then(data => setItems(Array.isArray(data) ? data : []))
            .catch(() => setItems([]))
            .finally(() => setCargandoItems(false));
    }, [despacho.idDespacho]);

    const handleDescargarExcel = () => {
        setErrorExcel(null);
        try {
            const wb = XLSX.utils.book_new();

            // ── Hoja 1: Cabecera del expediente ──
            const cabeceraData = [
                ['Matriz de Liquidación (Anexo B)'],
                [],
                ['Expediente',   despacho.codigoOrden ?? ''],
                ['Operación',    despacho.codigoBl    ?? ''],
                ['HUC',          despacho.codigoBl    ?? ''],
                ['Fecha',        new Date().toLocaleDateString('es-PE')],
                ['Moneda',       'USD'],
                ['Cliente',      despacho.razonSocial ?? ''],
                [],
                ['VALORES FOB/CIF/FLETE/SEGURO'],
                ['Concepto',        'Monto (USD)'],
                ['FOB',             fmt(valorFOB)],
                ['Flete',           fmt(flete)],
                ['Seguro',          fmt(seguro)],
                ['CIF',             fmt(valorCIF)],
                [],
                ['TRIBUTOS ADUANEROS'],
                ['Concepto',        'Monto (USD)'],
                ['Ad Valorem (6%)', fmt(adValorem)],
                ['IGV (16%)',       fmt(igv)],
                ['IPM (2%)',        fmt(ipm)],
                ['Total Tributos',  fmt(total)],
            ];
            const wsCabecera = XLSX.utils.aoa_to_sheet(cabeceraData);
            wsCabecera['!cols'] = [{ wch: 28 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsCabecera, 'Expediente');

            // ── Hoja 2: Detalle de ítems ──
            const itemsHeader = [
                ['#', 'Descripción', 'Partida Aranc.', 'País Origen', 'U.M.', 'Cantidad', 'Precio Unit.', 'Costo Total', 'N° Cajas', 'Volumen (m³)', 'Peso Bruto (KG)', 'Peso Neto (KG)']
            ];
            const itemsRows = items.map((it, i) => {
                const c = Number(it.cantidad) || 0;
                const p = Number(it.valor) || 0;
                return [
                    i + 1,
                    it.descripcion ?? '',
                    it.partidaArancelaria ?? '',
                    it.paisOrigen ?? '',
                    it.unidadMedida ?? '',
                    c,
                    p,
                    c * p,
                    it.numCajas ?? '',
                    it.volumen ?? '',
                    it.pesoBruto ?? '',
                    it.pesoNeto ?? '',
                ];
            });
            const totalesRow = [
                '', 'TOTALES', '', '', '',
                items.reduce((s, it) => s + (Number(it.cantidad) || 0), 0),
                '',
                items.reduce((s, it) => s + ((Number(it.cantidad) || 0) * (Number(it.valor) || 0)), 0),
                items.reduce((s, it) => s + (Number(it.numCajas) || 0), 0),
                items.reduce((s, it) => s + (Number(it.volumen)  || 0), 0),
                items.reduce((s, it) => s + (Number(it.pesoBruto)|| 0), 0),
                items.reduce((s, it) => s + (Number(it.pesoNeto) || 0), 0),
            ];
            const wsItems = XLSX.utils.aoa_to_sheet([...itemsHeader, ...itemsRows, totalesRow]);
            wsItems['!cols'] = [
                { wch: 4 }, { wch: 36 }, { wch: 14 }, { wch: 14 }, { wch: 6 },
                { wch: 10 }, { wch: 12 }, { wch: 13 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 14 }
            ];
            XLSX.utils.book_append_sheet(wb, wsItems, 'Detalle Ítems');

            XLSX.writeFile(wb, 'Matriz de Liquidación (Anexo B).xlsx');
            setExcelDescargado(true);
        } catch {
            setErrorExcel('Error al generar el archivo Excel. Intenta nuevamente');
        }
    };

    const handleGuardar = async () => {
        if (!excelDescargado || guardando) return;
        setGuardando(true);
        setError(null);
        try {
            const res = await fetch(`${API_DESPACHO}/${despacho.idDespacho}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Borrador Finalizado' })
            });
            if (!res.ok) {
                const d = await res.json();
                setError(d.mensaje || 'Error al guardar el borrador.');
                return;
            }
            setGenerado(true);
            onGenerado?.('Borrador Finalizado');
        } catch {
            setError('Error al conectar con el servidor. Intenta nuevamente');
        } finally {
            setGuardando(false);
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

    const yaGenerado = despacho.estado === 'Borrador Finalizado';

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                ← Volver
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Generar Borrador DAM</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold font-mono">{despacho.codigoBl}</span>
            </p>

            {yaGenerado && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-4">
                    El borrador ya fue generado para este despacho
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {/* Paso 1: Descargar Excel */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-4">
                <h2 className="text-sm font-bold text-gray-700 mb-1">Paso 1 — Descargar la Matriz de Liquidación</h2>
                <p className="text-sm text-gray-500 mb-3">
                    El archivo incluye la cabecera del expediente, los tributos aduaneros y el detalle completo de
                    {cargandoItems ? ' ...' : ` ${items.length} ítems`}.
                </p>

                {errorExcel && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
                        {errorExcel}
                    </div>
                )}

                <button
                    onClick={handleDescargarExcel}
                    disabled={cargandoItems}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                        cargandoItems
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#008b9c] text-white hover:bg-[#007685]'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    DESCARGAR EXCEL
                </button>

                {excelDescargado && (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ Archivo descargado: Matriz de Liquidación (Anexo B).xlsx
                    </p>
                )}
            </div>

            {/* Paso 2: Guardar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-700 mb-1">Paso 2 — Confirmar y guardar el borrador</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Una vez descargada la Matriz de Liquidación, confirma la generación del borrador DAM. El estado del despacho cambiará a <strong>Borrador Finalizado</strong>.
                </p>

                <div className="flex justify-end">
                    <button
                        onClick={handleGuardar}
                        disabled={!excelDescargado || guardando || yaGenerado}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            !excelDescargado || guardando || yaGenerado
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-[#1a2540] text-white hover:bg-[#0f1a30]'
                        }`}
                    >
                        {guardando ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Guardando...
                            </>
                        ) : 'GUARDAR'}
                    </button>
                </div>
            </div>
        </div>
    );
}
