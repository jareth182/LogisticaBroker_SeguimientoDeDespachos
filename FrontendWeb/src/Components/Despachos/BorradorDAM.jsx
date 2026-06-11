import { useEffect, useState } from 'react';

const API = 'http://localhost:5018/api/ItemsFactura';

const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BorradorDAM({ despacho, onVolver, onIrEditar, onGenerarBorrador }) {
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch(`${API}/${despacho.idDespacho}`);
                if (!res.ok) throw new Error('Error al cargar los ítems');
                const data = await res.json();
                const mapped = data.map((it, i) => ({
                    _idx: i,
                    idItem: it.idItem,
                    descripcion: it.descripcion,
                    cantidad: it.cantidad,
                    precioUnitario: it.valor,
                    unidadMedida: it.unidadMedida || '',
                    paisOrigen: it.paisOrigen || '',
                    costoTotal: Number(it.cantidad) * Number(it.valor),
                }));
                setItems(mapped);
            } catch {
                setError('No se pudieron cargar los ítems del despacho.');
            } finally {
                setCargando(false);
            }
        };
        fetchItems();
    }, [despacho.idDespacho]);

    const totalCosto = items.reduce((s, it) => s + Number(it.costoTotal || 0), 0);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="font-mono text-gray-500">Expediente {despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Borrador DAM</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Borrador DAM</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Vista previa de los ítems del despacho. Use los botones de abajo para continuar.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!cargando && !error && (
                        <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                            {items.length} ítems
                        </span>
                    )}
                    <button
                        onClick={onVolver}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Volver
                    </button>
                </div>
            </div>

            {/* Estado de carga */}
            {cargando && (
                <div className="flex items-center justify-center py-16 text-gray-400">
                    <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando ítems...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            {!cargando && !error && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-sm font-medium">No hay ítems registrados para este despacho.</p>
                </div>
            )}

            {!cargando && !error && items.length > 0 && (
                <>
                    {/* Tabla */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#1a2540] text-white text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 text-center w-8">#</th>
                                        <th className="px-4 py-3 text-left">Descripción</th>
                                        <th className="px-4 py-3 text-center">U.M.</th>
                                        <th className="px-4 py-3 text-right">Cantidad</th>
                                        <th className="px-4 py-3 text-right">P. Unit. (USD)</th>
                                        <th className="px-4 py-3 text-left">País Origen</th>
                                        <th className="px-4 py-3 text-right">Costo Total (USD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((it, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-center">
                                                <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-[#e0f7fa] text-[#008b9c] text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <p className="text-gray-800 font-medium text-xs truncate" title={it.descripcion}>{it.descripcion}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[#008b9c] text-xs font-semibold">{it.unidadMedida || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-gray-700 text-xs font-mono">{it.cantidad}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-gray-600 text-xs font-mono">{fmt(it.precioUnitario)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-500 text-xs">{it.paisOrigen || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-xs font-semibold font-mono text-gray-700">{fmt(it.costoTotal)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td colSpan={6} className="px-4 py-3 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">
                                            Total Costo (USD)
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-[#1a2540] font-mono">
                                            {fmt(totalCosto)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-5 flex items-center justify-end gap-3">
                        <button
                            onClick={() => onIrEditar(items)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-[#1a2540] text-[#1a2540] hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Editar Detalle de Mercancía
                        </button>
                        <button
                            onClick={() => onGenerarBorrador(items)}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#1a2540] text-white hover:bg-[#0f1a30] transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Generar Borrador DAM
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
