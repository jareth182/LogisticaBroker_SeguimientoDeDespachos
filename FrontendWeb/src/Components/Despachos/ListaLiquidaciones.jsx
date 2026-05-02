import { useState, useEffect } from 'react';

const API_DAM       = 'http://localhost:5018/api/DAM';
const API_DESPACHOS = 'http://localhost:5018/api/Despachos';

// ── Modal de detalle para DAM finalizada ──────────────────────
function ModalDetalle({ dam, despacho, onCerrar }) {
    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return f; }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-green-400 to-teal-400" />
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">DAM #{dam.idDam} — Liquidación Oficial</h3>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Finalizado</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Creado: {formatFecha(dam.fechaCreacion)}
                            {dam.fechaFinalizacion && ` · Finalizado: ${formatFecha(dam.fechaFinalizacion)}`}
                        </p>
                    </div>
                    <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs">
                        <p className="font-semibold text-gray-600 mb-1">{despacho.codigoOrden} · {despacho.razonSocial}</p>
                        <p className="font-mono text-gray-500">BL: {despacho.codigoBl}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valores aduaneros</p>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            {[
                                { label: 'Valor FOB', value: `$ ${(dam.valorFob||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                { label: 'Flete',     value: `$ ${(dam.flete||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                { label: 'Seguro',    value: `$ ${(dam.seguro||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                            ].map(f => (
                                <div key={f.label} className="flex justify-between px-4 py-2.5 border-b border-gray-50 text-sm">
                                    <span className="text-gray-400">{f.label}</span>
                                    <span className="font-semibold text-gray-700">{f.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between px-4 py-3 bg-[#f0fdfa]">
                                <span className="text-sm font-bold text-[#0f766e]">Valor CIF Total</span>
                                <span className="text-base font-bold text-[#0f766e]">$ {(dam.valorCifTotal||0).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datos generales</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { label: 'Importador',     value: dam.importadorExportador || '—' },
                                { label: 'Identificación', value: dam.codDocIdentificacion  || '—' },
                                { label: 'Vía transporte', value: dam.viaTransporte         || '—' },
                                { label: 'Puerto embarque',value: dam.puertoEmbarque        || '—' },
                            ].map(f => (
                                <div key={f.label} className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-gray-400 mb-0.5">{f.label}</p>
                                    <p className="font-semibold text-gray-700 truncate">{f.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={onCerrar} className="w-full px-4 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ListaLiquidaciones({ despacho, onAbrir, onVolver }) {
    const [dam, setDam]                         = useState(null);
    const [loading, setLoading]                 = useState(true);
    const [modalAbierto, setModalAbierto]       = useState(false);
    const [partidas, setPartidas]               = useState([]);
    const [loadingPartidas, setLoadingPartidas] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            // Cargar DAM
            try {
                const res = await fetch(`${API_DAM}/${despacho.idDespacho}/borrador`);
                if (res.ok) setDam(await res.json());
                else setDam(null);
            } catch (e) { console.error(e); setDam(null); }
            finally { setLoading(false); }

            // Cargar partidas clasificadas
            try {
                const resP = await fetch(`${API_DESPACHOS}/${despacho.idDespacho}/partidas`);
                if (resP.ok) setPartidas(await resP.json());
                else setPartidas([]);
            } catch { setPartidas([]); }
            finally { setLoadingPartidas(false); }
        };
        cargar();
    }, [despacho.idDespacho]);

    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return f; }
    };

    const handleAccionPrincipal = () => {
        if (!dam) { onAbrir(despacho); return; }
        if (dam.edicionBloqueada) { setModalAbierto(true); return; }
        onAbrir(despacho);
    };

    const labelBoton = !dam ? 'Nueva liquidación' : dam.edicionBloqueada ? 'Ver detalle' : 'Continuar editando';
    const iconoBoton = !dam
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        : dam.edicionBloqueada
            ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;

    return (
        <div className="max-w-4xl mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Despachos</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-600 font-medium">{despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Liquidaciones</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Liquidaciones del despacho</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {despacho.codigoOrden} · {despacho.razonSocial} · BL: <span className="font-mono">{despacho.codigoBl}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onVolver}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Volver
                    </button>
                    {!loading && (
                        <button onClick={handleAccionPrincipal}
                            className="flex items-center gap-2 px-4 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{iconoBoton}</svg>
                            {labelBoton}
                        </button>
                    )}
                </div>
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <svg className="w-8 h-8 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                </div>
            ) : !dam ? (
                <div className="space-y-4">
                    {/* Sin DAM — estado vacío */}
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-gray-600 font-semibold">No hay liquidaciones para este despacho</p>
                        <p className="text-sm text-gray-400 mt-1">Haz clic en "Nueva liquidación" para comenzar.</p>
                        <button onClick={() => onAbrir(despacho)}
                            className="mt-4 px-4 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors">
                            + Nueva liquidación
                        </button>
                    </div>

                    {/* Partidas aunque no haya DAM */}
                    {partidas.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Partidas arancelarias clasificadas</p>
                                    <p className="text-xs text-gray-400">Subpartidas nacionales asociadas a este expediente</p>
                                </div>
                                <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">{partidas.length}</span>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <TablaPartidas partidas={partidas} />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Estado',    value: dam.edicionBloqueada ? 'Finalizado' : 'Borrador', color: dam.edicionBloqueada ? 'text-green-700 bg-green-50 border-green-200' : 'text-blue-700 bg-blue-50 border-blue-200' },
                            { label: 'Valor CIF', value: `$ ${(dam.valorCifTotal||0).toLocaleString('en-US', {minimumFractionDigits:2})}`, color: 'text-[#008b9c] bg-[#e0f7fa] border-[#99f6e4]' },
                            { label: 'ID DAM',    value: `#${dam.idDam}`, color: 'text-gray-700 bg-gray-50 border-gray-200' },
                        ].map(s => (
                            <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{s.label}</p>
                                <p className="text-xl font-bold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Tarjeta DAM ── */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className={`h-1.5 ${dam.edicionBloqueada ? 'bg-gradient-to-r from-green-400 to-teal-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`} />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-base font-bold text-gray-900">
                                            DAM #{dam.idDam} — {dam.edicionBloqueada ? 'Liquidación Oficial' : 'Borrador en progreso'}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${dam.edicionBloqueada ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {dam.edicionBloqueada ? '✓ Finalizado' : '◉ Borrador'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Creado: {formatFecha(dam.fechaCreacion)}
                                        {dam.fechaFinalizacion && ` · Finalizado: ${formatFecha(dam.fechaFinalizacion)}`}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs border-t border-gray-100 pt-4">
                                {[
                                    { label: 'Importador',      value: dam.importadorExportador || '—' },
                                    { label: 'Identificación',  value: dam.codDocIdentificacion  || '—' },
                                    { label: 'Valor FOB',       value: `$ ${(dam.valorFob||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                    { label: 'Flete',           value: `$ ${(dam.flete||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                    { label: 'Seguro',          value: `$ ${(dam.seguro||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                    { label: 'Valor CIF',       value: `$ ${(dam.valorCifTotal||0).toLocaleString('en-US', {minimumFractionDigits:2})}` },
                                    { label: 'Vía transporte',  value: dam.viaTransporte  || '—' },
                                    { label: 'Puerto embarque', value: dam.puertoEmbarque || '—' },
                                ].map(f => (
                                    <div key={f.label} className="flex justify-between items-center py-1 border-b border-gray-50">
                                        <span className="text-gray-400">{f.label}</span>
                                        <span className="font-semibold text-gray-700 truncate max-w-[160px] text-right">{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Partidas arancelarias — tarjeta separada ── */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Partidas arancelarias clasificadas</p>
                                <p className="text-xs text-gray-400">Subpartidas nacionales asociadas a este expediente</p>
                            </div>
                            {partidas.length > 0 && (
                                <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                                    {partidas.length}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            {loadingPartidas ? (
                                <div className="flex items-center justify-center h-12">
                                    <svg className="w-5 h-5 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                </div>
                            ) : partidas.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No hay partidas clasificadas para este despacho.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <TablaPartidas partidas={partidas} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal detalle */}
            {modalAbierto && dam && (
                <ModalDetalle
                    dam={dam}
                    despacho={despacho}
                    onCerrar={() => setModalAbierto(false)}
                />
            )}
        </div>
    );
}

// ── Tabla reutilizable de partidas ────────────────────────────
function TablaPartidas({ partidas }) {
    return (
        <table className="w-full text-sm text-left">
            <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    <th className="pb-3 pr-4">Partida Nacional</th>
                    <th className="pb-3 pr-4">Subpartida NABAN</th>
                    <th className="pb-3 pr-4">Bultos</th>
                    <th className="pb-3 pr-4">Peso Neto</th>
                    <th className="pb-3">Peso Bruto</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {partidas.map(p => (
                    <tr key={p.idPartida}>
                        <td className="py-3 pr-4 font-mono font-bold text-gray-800">{p.partidaNacional}</td>
                        <td className="py-3 pr-4 text-gray-500">{p.subpartidaNaban || '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.cantidadBultos}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.pesoNetoKg} kg</td>
                        <td className="py-3 text-gray-600">{p.pesoBrutoKg} kg</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}