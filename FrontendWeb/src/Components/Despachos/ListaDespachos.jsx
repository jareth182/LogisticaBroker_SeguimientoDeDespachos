import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5018/api/Despachos';

/* ── Badge de estado ──────────────────────────────────────── */
function EstadoBadge({ estado }) {
    const map = {
        'Canal Verde':   { bg: 'bg-green-50',  text: 'text-green-700'  },
        'Canal Naranja': { bg: 'bg-orange-50', text: 'text-orange-700' },
        'Canal Rojo':    { bg: 'bg-red-50',    text: 'text-red-700'    },
        'Pendiente':     { bg: 'bg-gray-100',  text: 'text-gray-600'   },
        'En Apertura':   { bg: 'bg-blue-50',   text: 'text-blue-700'   },
        'En Proceso':    { bg: 'bg-orange-50', text: 'text-orange-700' },
        'Liquidación Terminada': { bg: 'bg-green-50', text: 'text-green-700' },
    };
    const cfg = map[estado];
    if (!cfg) return <span className="text-xs text-gray-400">{estado || '—'}</span>;
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {estado}
        </span>
    );
}

/* ── Botón de acciones ────────────────────────────────────── */
function BtnAcciones({ despacho, onVerDetalle, onDocumentacionLogistica, onExtraerFactura, onVerTributos, onAdjuntarComprobantes, onValidarComprobantes, onRegistrarNumeracion, onObservacionesAforo, esCliente }) {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const estado = despacho.estado || '';
    const canalNaranjaORojo = estado === 'Canal Naranja' || estado === 'Canal Rojo';

    const accion = (fn) => { setAbierto(false); fn?.(despacho); };

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setAbierto(v => !v)}
                className={`p-1.5 rounded-lg transition-colors text-base leading-none ${abierto ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                title="Opciones"
            >
                ⚙️
            </button>
            {abierto && (
                <div className="absolute right-0 top-8 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Ver detalle — siempre disponible */}
                    <button
                        onClick={() => accion(onVerDetalle)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver detalle
                    </button>

                    {/* HU09: Documentación Logística — solo Admin */}
                    {!esCliente && (
                        <button
                            onClick={() => accion(onDocumentacionLogistica)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Documentación logística
                        </button>
                    )}

                    {/* HU10: Extraer Datos Factura — solo Admin */}
                    {!esCliente && (
                        <button
                            onClick={() => accion(onExtraerFactura)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h7" />
                            </svg>
                            Extraer datos factura
                        </button>
                    )}

                    {/* HU13: Ver tributos — Admin y Cliente, siempre disponible */}
                    <button
                        onClick={() => accion(onVerTributos)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        Ver liquidación tributaria
                    </button>

                    {/* HU14: Adjuntar comprobantes — solo Cliente */}
                    {esCliente && (
                        <button
                            onClick={() => accion(onAdjuntarComprobantes)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Adjuntar comprobantes
                        </button>
                    )}

                    {/* HU15: Validar comprobantes — solo Admin, estado Pago en Verificación */}
                    {!esCliente && estado === 'Pago en Verificación' && (
                        <button
                            onClick={() => accion(onValidarComprobantes)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Validar comprobante
                        </button>
                    )}

                    {/* HU16: Registrar numeración — solo Admin, estado Tributos Cancelados */}
                    {!esCliente && estado === 'Tributos Cancelados' && (
                        <button
                            onClick={() => accion(onRegistrarNumeracion)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            Registrar numeración
                        </button>
                    )}

                    {/* HU17: Observaciones aforo — solo Admin, canal Naranja o Rojo */}
                    {!esCliente && canalNaranjaORojo && (
                        <button
                            onClick={() => accion(onObservacionesAforo)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left"
                        >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Observaciones de aforo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Componente principal ─────────────────────────────────── */
export default function ListaDespachos({ onNuevoDespacho, onVerDetalle, onDocumentacionLogistica, onExtraerFactura, onVerTributos, onAdjuntarComprobantes, onValidarComprobantes, onRegistrarNumeracion, onObservacionesAforo }) {
    const [despachos, setDespachos]           = useState([]);
    const [loading, setLoading]               = useState(true);
    const [busqueda, setBusqueda]             = useState('');
    const [busquedaActiva, setBusquedaActiva] = useState('');
    const [paginaActual, setPaginaActual]     = useState(1);
    const ITEMS_POR_PAGINA = 10;

    const usuario = (() => {
        try { return JSON.parse(localStorage.getItem('usuario') || '{}'); } catch { return {}; }
    })();
    const esCliente = usuario.rol === 'Cliente';

    const cargar = async () => {
        setLoading(true);
        try {
            const url = esCliente && usuario.idEmpresa
                ? `${API}?idEmpresa=${usuario.idEmpresa}`
                : API;
            const res = await fetch(url);
            if (res.ok) setDespachos(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, []);

    const fmtFecha = (f) => {
        if (!f) return '—';
        try {
            const d = new Date(f);
            return isNaN(d) ? String(f) : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return String(f); }
    };

    const filtrados = despachos.filter(d => {
        const q = busquedaActiva.toLowerCase().trim();
        if (!q) return true;
        return d.codigoBl?.toLowerCase().includes(q) || d.codigoOrden?.toLowerCase().includes(q) || d.razonSocial?.toLowerCase().includes(q) || d.ruc?.toLowerCase().includes(q);
    });

    /* Contadores exactos según CA HU07 */
    const stats = [
        { label: 'TOTAL ACTIVOS',  value: despachos.length,                                              color: 'text-[#1a2540]' },
        { label: 'CANAL VERDE',    value: despachos.filter(d => d.estado === 'Canal Verde').length,      color: 'text-green-600'  },
        { label: 'CANAL NARANJA',  value: despachos.filter(d => d.estado === 'Canal Naranja').length,    color: 'text-orange-600' },
        { label: 'CANAL ROJO',     value: despachos.filter(d => d.estado === 'Canal Rojo').length,       color: 'text-red-600'    },
    ];

    const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
    const inicio       = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const pagina       = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

    const buscar = () => { setBusquedaActiva(busqueda); setPaginaActual(1); };
    const limpiarBusqueda = () => { setBusqueda(''); setBusquedaActiva(''); setPaginaActual(1); };

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visualizar Historial Despachos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {esCliente ? 'Expedientes de importación de tu empresa' : 'Expedientes de importación registrados en el sistema'}
                    </p>
                </div>
                {!esCliente && (
                    <button
                        onClick={onNuevoDespacho}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#243050] transition-colors shadow-sm"
                    >
                        NUEVO DESPACHO
                    </button>
                )}
            </div>

            {/* ── Contadores (CA HU07: TOTAL ACTIVOS, CANAL VERDE, CANAL NARANJA, CANAL ROJO) ── */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Buscador (CA HU07: placeholder exacto "Buscar BL o Código...") ── */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-lg">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && buscar()}
                        placeholder="Buscar BL o Código..."
                        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2540] focus:border-[#1a2540]"
                    />
                    {busqueda && (
                        <button onClick={limpiarBusqueda} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    onClick={buscar}
                    className="px-4 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors"
                >
                    Buscar
                </button>
                <button
                    onClick={cargar}
                    title="Refrescar"
                    className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-[#1a2540] hover:border-[#1a2540] transition-colors bg-white"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <span className="text-sm text-gray-400 ml-auto">
                    Mostrando {Math.min(inicio + ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length} registros
                </span>
            </div>

            {/* ── Tabla (7 columnas exactas según CA HU07) ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <svg className="w-8 h-8 animate-spin text-[#1a2540]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    </div>
                ) : pagina.length === 0 ? (
                    <div className="py-16 text-center">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 font-semibold">
                            {busquedaActiva ? 'No se encontraron resultados' : 'Aún no hay despachos registrados'}
                        </p>
                        {busquedaActiva && (
                            <button onClick={limpiarBusqueda} className="mt-3 text-sm text-[#1a2540] hover:underline font-medium">
                                Limpiar búsqueda
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">CÓDIGO INT.</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">RUC CLIENTE</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">BILL OF LADING (BL)</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">FECHA ARRIBO</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ESTADO ACTUAL</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {pagina.map(d => (
                                <tr key={d.idDespacho} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-[#1a2540] text-sm">{d.codigoOrden || '—'}</span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-sm text-gray-600">{d.ruc || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-gray-800 truncate max-w-[160px] block">{d.razonSocial || '—'}</span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-sm text-[#1a2540] font-semibold">{d.codigoBl || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {d.eta ? fmtFecha(d.eta) : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <EstadoBadge estado={d.estado} />
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <BtnAcciones
                                            despacho={d}
                                            esCliente={esCliente}
                                            onVerDetalle={onVerDetalle}
                                            onDocumentacionLogistica={onDocumentacionLogistica}
                                            onExtraerFactura={onExtraerFactura}
                                            onVerTributos={onVerTributos}
                                            onAdjuntarComprobantes={onAdjuntarComprobantes}
                                            onValidarComprobantes={onValidarComprobantes}
                                            onRegistrarNumeracion={onRegistrarNumeracion}
                                            onObservacionesAforo={onObservacionesAforo}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Paginación */}
                {!loading && filtrados.length > ITEMS_POR_PAGINA && (
                    <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <p className="text-xs text-gray-500">Página {paginaActual} de {totalPaginas}</p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                disabled={paginaActual === 1}
                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPaginaActual(p)}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-colors ${p === paginaActual ? 'bg-[#1a2540] text-white' : 'border border-gray-200 text-gray-600 hover:bg-white'}`}>
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                disabled={paginaActual === totalPaginas}
                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
