import { useState } from 'react';

// Hitos del flujo logístico-aduanero del despacho
const HITOS = [
    { id: 1, nombre: 'Documentación recibida', estado: 'completado', fecha: '02/06/2026', hora: '09:15', documentos: ['BL_original.pdf', 'Factura_comercial.pdf'] },
    { id: 2, nombre: 'Liquidación tributaria', estado: 'completado', fecha: '04/06/2026', hora: '11:40', documentos: ['Borrador_DAM.pdf', 'Resumen_tributario.pdf'] },
    { id: 3, nombre: 'Tributos cancelados', estado: 'completado', fecha: '06/06/2026', hora: '15:02', documentos: ['Comprobante_pago.pdf'] },
    { id: 4, nombre: 'Numeración aduanera', estado: 'completado', fecha: '08/06/2026', hora: '08:50', documentos: ['DAM_numerada.pdf'] },
    { id: 5, nombre: 'Aforo / Diligencias', estado: 'actual', fecha: '10/06/2026', hora: '10:20', documentos: ['Acta_inspeccion.pdf'] },
    { id: 6, nombre: 'Levante autorizado', estado: 'pendiente', fecha: null, hora: null, documentos: [] },
    { id: 7, nombre: 'En tránsito', estado: 'pendiente', fecha: null, hora: null, documentos: [] },
    { id: 8, nombre: 'Entregado', estado: 'pendiente', fecha: null, hora: null, documentos: [] },
];

export default function SeguimientoImportacion({ despacho }) {
    const [hitoSeleccionado, setHitoSeleccionado] = useState(null);

    // CA3: alerta visual si el despacho está en Canal Rojo (retención aduanera)
    const canal = despacho?.nombreCanal ?? 'Canal Rojo';
    const esCanalRojo = canal === 'Canal Rojo';

    const completados = HITOS.filter(h => h.estado === 'completado').length;
    const indiceActual = HITOS.findIndex(h => h.estado === 'actual');
    // CA1: barra de progreso dinámica según hitos completados
    const progreso = Math.round(((indiceActual >= 0 ? indiceActual : completados) / (HITOS.length - 1)) * 100);

    const detalle = HITOS.find(h => h.id === hitoSeleccionado);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Seguimiento de Importación</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
                &nbsp;· Canal: <span className="font-semibold">{canal}</span>
            </p>

            {/* CA3: alerta de atención requerida para Canal Rojo */}
            {esCanalRojo && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-bold text-red-800">Atención requerida — Retención aduanera (Canal Rojo)</p>
                        <p className="text-xs text-red-600">Tu carga fue seleccionada para inspección física por SUNAT. El equipo está gestionando las diligencias.</p>
                    </div>
                </div>
            )}

            {/* CA1: barra de progreso */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-700">Progreso del despacho</p>
                    <span className="text-sm font-bold text-[#008b9c]">{progreso}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#008b9c] rounded-full transition-all duration-700" style={{ width: `${progreso}%` }} />
                </div>
            </div>

            {/* CA1 + CA2: línea de tiempo interactiva */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <p className="text-sm font-bold text-gray-700 mb-5">Línea de tiempo</p>
                <div className="space-y-1">
                    {HITOS.map((h, i) => {
                        const completado = h.estado === 'completado';
                        const actual = h.estado === 'actual';
                        return (
                            <button
                                key={h.id}
                                onClick={() => setHitoSeleccionado(prev => (prev === h.id ? null : h.id))}
                                className={`w-full flex items-start gap-3 text-left rounded-lg px-2 py-1.5 transition-colors ${
                                    hitoSeleccionado === h.id ? 'bg-[#f0fbfc]' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        completado ? 'bg-[#008b9c] text-white'
                                            : actual ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]'
                                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                    }`}>
                                        {completado
                                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            : h.id}
                                    </div>
                                    {i < HITOS.length - 1 && <div className={`w-0.5 h-6 ${completado ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />}
                                </div>
                                <div className="pt-0.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-semibold ${actual ? 'text-[#008b9c]' : completado ? 'text-gray-700' : 'text-gray-400'}`}>{h.nombre}</p>
                                        {actual && <span className="text-[10px] font-bold text-[#008b9c] bg-[#e0f7fa] px-2 py-0.5 rounded-full">Etapa actual</span>}
                                    </div>
                                    {h.fecha && <p className="text-xs text-gray-400">{h.fecha} · {h.hora}</p>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* CA2: detalle del hito seleccionado — fecha, hora y documentos adjuntos */}
                {detalle && (
                    <div className="mt-5 border-t border-gray-100 pt-5">
                        <p className="text-sm font-bold text-gray-800 mb-3">Detalle: {detalle.nombre}</p>
                        {detalle.fecha ? (
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Fecha</p>
                                    <p className="text-gray-800">{detalle.fecha}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Hora</p>
                                    <p className="text-gray-800">{detalle.hora}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mb-4">Este hito aún no se ha completado.</p>
                        )}
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Documentos adjuntos</p>
                        {detalle.documentos.length > 0 ? (
                            <ul className="space-y-1.5">
                                {detalle.documentos.map((doc, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#008b9c]">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">Sin documentos adjuntos en este paso.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
