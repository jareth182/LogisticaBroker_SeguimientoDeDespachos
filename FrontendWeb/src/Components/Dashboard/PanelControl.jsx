import { useState } from 'react';

// KPIs del mes (mock)
const KPI = {
    despachosActivos: 18,
    despachosCerrados: 42,
    tiempoPromedioDias: 7.4,
};

// Distribución de despachos por estado (para gráfico de barras)
const POR_ESTADO = [
    { estado: 'Pendiente de Pago', cantidad: 5, color: '#f59e0b' },
    { estado: 'Pago en Verificación', cantidad: 3, color: '#3b82f6' },
    { estado: 'Numeración Registrada', cantidad: 4, color: '#8b5cf6' },
    { estado: 'En Tránsito', cantidad: 4, color: '#06b6d4' },
    { estado: 'Entregado', cantidad: 42, color: '#22c55e' },
];

// Tiempo promedio de atención por área (días)
const POR_AREA = [
    { area: 'Liquidación', dias: 2.1 },
    { area: 'Validación de pagos', dias: 1.4 },
    { area: 'Aforo', dias: 2.6 },
    { area: 'Transporte', dias: 1.3 },
];

// CA2: despachos estancados (>48h sin cambio de estado)
const ESTANCADOS = [
    { codigo: 'ORD-014', cliente: 'Importaciones Andinas SAC', estado: 'Aforo', horas: 73 },
    { codigo: 'ORD-021', cliente: 'Comercial del Pacífico EIRL', estado: 'Pago en Verificación', horas: 56 },
];

export default function PanelControl() {
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [formato, setFormato] = useState('Excel');

    const maxEstado = Math.max(...POR_ESTADO.map(e => e.cantidad));
    const maxArea = Math.max(...POR_AREA.map(a => a.dias));

    // Donut activos vs cerrados
    const totalDonut = KPI.despachosActivos + KPI.despachosCerrados;
    const pctActivos = KPI.despachosActivos / totalDonut;
    const circ = 2 * Math.PI * 42;

    // CA3: exportar reporte consolidado en Excel o PDF
    const handleExportar = () => {
        const lineas = [
            'PANEL DE CONTROL — REPORTE DE RENDIMIENTO',
            `Rango: ${desde || '—'} a ${hasta || '—'}`,
            `Formato: ${formato}`,
            '',
            `Despachos activos: ${KPI.despachosActivos}`,
            `Despachos cerrados (mes): ${KPI.despachosCerrados}`,
            `Tiempo promedio de atención: ${KPI.tiempoPromedioDias} días`,
            '',
            'Despachos por estado:',
            ...POR_ESTADO.map(e => `  ${e.estado}: ${e.cantidad}`),
            '',
            'Tiempo promedio por área (días):',
            ...POR_AREA.map(a => `  ${a.area}: ${a.dias}`),
            '',
            'Despachos estancados (>48h):',
            ...ESTANCADOS.map(e => `  ${e.codigo} — ${e.cliente} — ${e.estado} — ${e.horas}h`),
        ].join('\n');
        const tipo = formato === 'Excel' ? 'text/csv' : 'application/pdf';
        const ext = formato === 'Excel' ? 'csv' : 'pdf';
        const blob = new Blob([lineas], { type: tipo });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_rendimiento.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Panel de Control</h1>
            <p className="text-sm text-gray-500 mb-6">Rendimiento global, tiempos de atención por área y despachos con incidencias.</p>

            {/* CA1: KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Despachos activos</p>
                    <p className="text-3xl font-bold text-[#008b9c]">{KPI.despachosActivos}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cerrados del mes</p>
                    <p className="text-3xl font-bold text-green-600">{KPI.despachosCerrados}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tiempo prom. de atención</p>
                    <p className="text-3xl font-bold text-[#1a2540]">{KPI.tiempoPromedioDias} <span className="text-base font-semibold text-gray-400">días</span></p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* CA1: gráfico de barras — despachos por estado */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm col-span-2">
                    <p className="text-sm font-bold text-gray-700 mb-4">Despachos por estado</p>
                    <div className="space-y-3">
                        {POR_ESTADO.map(e => (
                            <div key={e.estado} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-40 shrink-0 truncate">{e.estado}</span>
                                <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                                    <div className="h-full rounded-md flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-700"
                                        style={{ width: `${(e.cantidad / maxEstado) * 100}%`, background: e.color }}>
                                        {e.cantidad}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CA1: gráfico de torta (donut) — activos vs cerrados */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col items-center">
                    <p className="text-sm font-bold text-gray-700 mb-3 self-start">Activos vs Cerrados</p>
                    <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="14" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#008b9c" strokeWidth="14"
                            strokeDasharray={`${circ * pctActivos} ${circ}`} />
                    </svg>
                    <div className="flex gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#008b9c]" />Activos</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500" />Cerrados</span>
                    </div>
                </div>
            </div>

            {/* CA1: tiempo promedio por área */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
                <p className="text-sm font-bold text-gray-700 mb-4">Tiempo promedio de atención por área (días)</p>
                <div className="flex items-end gap-6 h-40">
                    {POR_AREA.map(a => (
                        <div key={a.area} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-xs font-bold text-gray-700 mb-1">{a.dias}</span>
                            <div className="w-full bg-[#008b9c] rounded-t-md transition-all duration-700"
                                style={{ height: `${(a.dias / maxArea) * 100}%` }} />
                            <span className="text-[11px] text-gray-500 mt-2 text-center">{a.area}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CA2: alertas gerenciales — despachos estancados (>48h) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <h2 className="text-sm font-bold text-gray-700">Alertas gerenciales — Despachos estancados</h2>
                </div>
                {ESTANCADOS.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-gray-400 text-center">No hay despachos estancados.</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <th className="px-5 py-3">Código</th>
                                <th className="px-5 py-3">Cliente</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3 text-right">Inactividad</th>
                                <th className="px-5 py-3 text-center">Alerta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ESTANCADOS.map(e => (
                                <tr key={e.codigo} className="bg-amber-50/40">
                                    <td className="px-5 py-3 font-bold text-[#1a2540]">{e.codigo}</td>
                                    <td className="px-5 py-3 text-gray-700">{e.cliente}</td>
                                    <td className="px-5 py-3 text-gray-600">{e.estado}</td>
                                    <td className="px-5 py-3 text-right text-gray-600">{e.horas} h</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Estancado</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CA3: informe mensual — rango de fechas + Exportar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Informe mensual de rendimiento</p>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Formato</label>
                        <select value={formato} onChange={e => setFormato(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c]">
                            <option value="Excel">Excel</option>
                            <option value="PDF">PDF</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExportar}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2540] hover:bg-[#243050] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );
}
