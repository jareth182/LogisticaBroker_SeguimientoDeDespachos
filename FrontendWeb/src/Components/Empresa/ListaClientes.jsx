import { useState, useEffect } from 'react';

const API = 'http://localhost:5018/api/Empresa';

// ── Avatar con iniciales ──────────────────────────────────────
function Avatar({ nombre, size = 'md' }) {
    const iniciales = nombre
        ?.split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() || '?';

    const colors = [
        'bg-violet-500', 'bg-[#008b9c]', 'bg-rose-500',
        'bg-amber-500',  'bg-emerald-500', 'bg-blue-500',
        'bg-fuchsia-500', 'bg-orange-500'
    ];
    const color = colors[iniciales.charCodeAt(0) % colors.length];
    const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-xs';

    return (
        <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
            {iniciales}
        </div>
    );
}

// ── Badge de estado ───────────────────────────────────────────
function EstadoBadge({ estado }) {
    const cfg = {
        'Activo':    { dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
        'Inactivo':  { dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200'  },
        'Pendiente': { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
        'Suspendido':{ dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'   },
    }[estado] || { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {estado || 'Pendiente'}
        </span>
    );
}

export default function ListaClientes({ onNuevoCliente }) {
    const [empresas, setEmpresas]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [busqueda, setBusqueda]     = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [vista, setVista]           = useState('grid'); // 'grid' | 'tabla'

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const res = await fetch(API);
                if (res.ok) setEmpresas(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    // ── Filtros ───────────────────────────────────────────────
    const empresasFiltradas = empresas.filter(e => {
        const q = busqueda.toLowerCase();
        const matchBusqueda = !q ||
            e.razonSocial?.toLowerCase().includes(q) ||
            e.ruc?.includes(q) ||
            e.correo?.toLowerCase().includes(q) ||
            e.nombreContacto?.toLowerCase().includes(q);
        const matchEstado = filtroEstado === 'Todos' || e.estado === filtroEstado;
        return matchBusqueda && matchEstado;
    });

    // ── Stats ─────────────────────────────────────────────────
    const stats = {
        total:    empresas.length,
        activos:  empresas.filter(e => e.estado === 'Activo').length,
        pendientes: empresas.filter(e => e.estado === 'Pendiente').length,
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return f; }
    };

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-sm text-gray-500 mt-1">Empresas importadoras registradas en el sistema</p>
                </div>
                <button
                    onClick={onNuevoCliente}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-xl hover:bg-[#007685] transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Cliente
                </button>
            </div>

            {/* ── Stats cards ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total clientes',  value: stats.total,     icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-[#008b9c] bg-[#e0f7fa]' },
                    { label: 'Activos',          value: stats.activos,   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',                                                                                                                                                                                                                                                          color: 'text-green-600 bg-green-50'  },
                    { label: 'Pendientes',       value: stats.pendientes, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                                                                                                                                                                                                                          color: 'text-amber-600 bg-amber-50'  },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Barra de búsqueda y filtros ── */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por RUC, razón social, correo o contacto..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c]"
                    />
                </div>

                {/* Filtro estado */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    {['Todos', 'Activo', 'Pendiente', 'Inactivo'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltroEstado(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                filtroEstado === f
                                    ? 'bg-[#008b9c] text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Toggle vista */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                        onClick={() => setVista('grid')}
                        className={`p-1.5 rounded-lg transition-colors ${vista === 'grid' ? 'bg-[#008b9c] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista tarjetas"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setVista('tabla')}
                        className={`p-1.5 rounded-lg transition-colors ${vista === 'tabla' ? 'bg-[#008b9c] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista tabla"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Contenido ── */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-8 h-8 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <p className="text-sm text-gray-400">Cargando clientes...</p>
                    </div>
                </div>
            ) : empresasFiltradas.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-semibold">
                        {busqueda || filtroEstado !== 'Todos' ? 'No se encontraron resultados' : 'Aún no hay clientes registrados'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        {busqueda || filtroEstado !== 'Todos' ? 'Intenta con otros filtros' : 'Haz clic en "Nuevo Cliente" para registrar el primero'}
                    </p>
                    {!busqueda && filtroEstado === 'Todos' && (
                        <button
                            onClick={onNuevoCliente}
                            className="mt-4 px-4 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors"
                        >
                            + Nuevo Cliente
                        </button>
                    )}
                </div>
            ) : vista === 'grid' ? (

                /* ── VISTA GRID ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {empresasFiltradas.map(e => (
                        <div key={e.idEmpresa} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#008b9c]/30 transition-all duration-200 overflow-hidden group">

                            {/* Top strip */}
                            <div className="h-1.5 bg-gradient-to-r from-[#008b9c] to-[#00b4d8]" />

                            <div className="p-5">
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar nombre={e.razonSocial} size="lg" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                                                {e.razonSocial}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{e.ruc}</p>
                                        </div>
                                    </div>
                                    <EstadoBadge estado={e.estado} />
                                </div>

                                {/* Info */}
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="truncate">{e.nombreContacto || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="truncate">{e.correo || '—'}</span>
                                    </div>
                                    {e.celular && (
                                        <div className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{e.celular}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400">
                                        Registrado {formatFecha(e.fechaRegistro)}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#008b9c] transition-colors" title="Ver detalle">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#008b9c] transition-colors" title="Editar">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            ) : (

                /* ── VISTA TABLA ── */
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">RUC</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Correo</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Registro</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {empresasFiltradas.map(e => (
                                <tr key={e.idEmpresa} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar nombre={e.razonSocial} />
                                            <span className="font-semibold text-gray-800 truncate max-w-[180px]">{e.razonSocial}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{e.ruc}</td>
                                    <td className="px-6 py-4 text-gray-600">{e.nombreContacto || '—'}</td>
                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[180px]">{e.correo || '—'}</td>
                                    <td className="px-6 py-4"><EstadoBadge estado={e.estado} /></td>
                                    <td className="px-6 py-4 text-gray-400 text-xs">{formatFecha(e.fechaRegistro)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#008b9c] transition-colors" title="Ver detalle">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#008b9c] transition-colors" title="Editar">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer tabla */}
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Mostrando {empresasFiltradas.length} de {empresas.length} clientes
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}