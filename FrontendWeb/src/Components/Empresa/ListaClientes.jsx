import { useState, useEffect } from 'react';

const API              = 'http://localhost:5018/api/Empresa';
const ITEMS_POR_PAGINA = 6;

function EstadoBadge({ estado }) {
    const cfg = {
        'Activo':         { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-100'  },
        'Inactivo':       { dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-100'    },
        'Pendiente':      { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-100'  },
        'Afiliado Activo':{ dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-100'  },
        'Suspendido':     { dot: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-100'   },
    }[estado] || { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {estado || 'Pendiente'}
        </span>
    );
}

function Paginacion({ paginaActual, totalPaginas, onChange }) {
    if (totalPaginas <= 1) return null;

    const paginas = [];
    for (let i = 1; i <= Math.min(totalPaginas, 3); i++) paginas.push(i);
    const hayMas = totalPaginas > 3;

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onChange(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {paginas.map(p => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-semibold transition-colors ${
                        p === paginaActual
                            ? 'bg-[#1a2540] text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {p}
                </button>
            ))}

            {hayMas && (
                <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
            )}

            <button
                onClick={() => onChange(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

const esActivo = (estado) => estado === 'Activo' || estado === 'Afiliado Activo';

export default function ListaClientes({ onNuevoCliente }) {
    const [empresas, setEmpresas]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [busqueda, setBusqueda]       = useState('');
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [pagina, setPagina]           = useState(1);

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

    useEffect(() => { setPagina(1); }, [busqueda, filtroEstado]);

    const formatFecha = (f) => {
        if (!f) return '—';
        try {
            const d = new Date(f);
            return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        } catch { return f; }
    };

    const totalClientes = empresas.length;
    const totalActivos  = empresas.filter(e => esActivo(e.estado)).length;
    const totalPendientes = empresas.filter(e => e.estado === 'Pendiente').length;

    const empresasFiltradas = empresas.filter(e => {
        const q = busqueda.toLowerCase().trim();
        const coincideBusqueda = !q || e.razonSocial?.toLowerCase().includes(q) || e.ruc?.includes(q) || e.correo?.toLowerCase().includes(q) || e.nombreContacto?.toLowerCase().includes(q);
        const coincideFiltro = filtroEstado === 'Todos'
            || (filtroEstado === 'Activo' ? esActivo(e.estado) : e.estado === filtroEstado);
        return coincideBusqueda && coincideFiltro;
    });

    const totalPaginas   = Math.ceil(empresasFiltradas.length / ITEMS_POR_PAGINA);
    const inicio         = (pagina - 1) * ITEMS_POR_PAGINA;
    const fin            = Math.min(inicio + ITEMS_POR_PAGINA, empresasFiltradas.length);
    const empresasPagina = empresasFiltradas.slice(inicio, fin);

    return (
        <div>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visualizar Directorio de Clientes</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestión y visualización de empresas registradas.</p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                    <div className="relative">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar RUC o Razón Social..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
                        />
                    </div>

                    <button
                        onClick={onNuevoCliente}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors"
                    >
                        + Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* ── Contadores ── */}
            <div className="flex gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm shadow-sm">
                    <span className="text-gray-500">Total clientes</span>
                    <span className="ml-2 font-bold text-gray-900">{totalClientes}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm shadow-sm">
                    <span className="text-gray-500">Activos</span>
                    <span className="ml-2 font-bold text-green-700">{totalActivos}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm shadow-sm">
                    <span className="text-gray-500">Pendientes</span>
                    <span className="ml-2 font-bold text-amber-700">{totalPendientes}</span>
                </div>
            </div>

            {/* ── Filtros ── */}
            <div className="flex gap-2 mb-4">
                {['Todos', 'Activo', 'Pendiente', 'Inactivo'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltroEstado(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            filtroEstado === f
                                ? 'bg-[#1a2540] text-white border-[#1a2540]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Tabla ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <svg className="w-7 h-7 animate-spin text-[#1a2540]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    </div>
                ) : empresasFiltradas.length === 0 ? (
                    <div className="py-16 text-center">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 font-semibold">
                            {busqueda || filtroEstado !== 'Todos' ? 'No se encontraron resultados' : 'Aún no hay clientes registrados'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {busqueda || filtroEstado !== 'Todos' ? 'Intenta con otro filtro o búsqueda' : 'Haz clic en "+ Nuevo Cliente" para registrar el primero'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">RUC</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {empresasPagina.map(e => (
                                <tr key={e.idEmpresa} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{e.razonSocial}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{e.ruc}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{e.nombreContacto || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{e.correo || '—'}</td>
                                    <td className="px-6 py-4"><EstadoBadge estado={e.estado} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatFecha(e.fechaRegistro)}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                            title="Editar cliente"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && empresasFiltradas.length > 0 && (
                    <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Mostrando {inicio + 1} a {fin} de {empresasFiltradas.length} registros
                        </p>
                        <Paginacion
                            paginaActual={pagina}
                            totalPaginas={totalPaginas}
                            onChange={p => { if (p >= 1 && p <= totalPaginas) setPagina(p); }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
