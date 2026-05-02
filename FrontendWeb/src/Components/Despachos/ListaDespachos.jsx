import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5018/api/Despachos';

export default function ListaDespachos({ refreshKey = 0, onVerDetalle }) {
    const [despachos, setDespachos] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDespachos = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_BASE_URL);
            if (res.ok) setDespachos(await res.json());
        } catch (err) {
            console.error('Error fetching despachos', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDespachos();
    }, [refreshKey]);

    const formatDate = (iso) => {
        try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
    };

    const estadoClass = (estado) => {
        if (!estado) return 'bg-gray-100 text-gray-700';
        const key = estado.toLowerCase();
        if (key.includes('apertura'))  return 'bg-orange-100 text-orange-700';
        if (key.includes('transito') || key.includes('tránsito')) return 'bg-green-100 text-green-700';
        if (key.includes('aduana'))    return 'bg-purple-100 text-purple-700';
        if (key.includes('liquidaci')) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Agenda Operativa - Despachos Recientes</h1>

            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={fetchDespachos}
                    className="px-3 py-2 bg-[#008b9c] text-white rounded text-sm font-semibold"
                >
                    {loading ? 'Cargando...' : 'Refrescar'}
                </button>
                <div className="text-sm text-gray-500">Total: {despachos.length}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-6 py-4">Código Interno</th>
                                <th className="px-6 py-4">RUC Importador</th>
                                <th className="px-6 py-4">Importador</th>
                                <th className="px-6 py-4">Bill of Lading (BL)</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Fecha Creación</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                            {despachos.map(d => (
                                <tr key={d.idDespacho} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{d.codigoOrden}</td>
                                    <td className="px-6 py-4">{d.ruc}</td>
                                    <td className="px-6 py-4">{d.razonSocial}</td>
                                    <td className="px-6 py-4 font-mono">{d.codigoBl}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${estadoClass(d.estado)}`}>
                                            {d.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{formatDate(d.fechaCreacion)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-3">
                                            {/* ── Ver detalle ── */}
                                            <button
                                                onClick={() => onVerDetalle?.(d)}
                                                className="text-gray-400 hover:text-[#008b9c] transition-colors"
                                                title="Ver detalle"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            {/* ── Editar ── */}
                                            <button
                                                className="text-gray-400 hover:text-[#008b9c] transition-colors"
                                                title="Actualizar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}