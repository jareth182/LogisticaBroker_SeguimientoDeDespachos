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

const ESTADOS = ['Pendiente', 'Activo', 'Afiliado Activo', 'Inactivo', 'Suspendido'];

export default function ListaClientes({ onNuevoCliente, onEditarCliente }) {
    const [empresas, setEmpresas]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [busqueda, setBusqueda]           = useState('');
    const [filtroEstado, setFiltroEstado]   = useState('Todos');
    const [pagina, setPagina]               = useState(1);
    const [mensaje, setMensaje]             = useState(null);
    const [confirmEliminar, setConfirmEliminar] = useState(null);
    const [eliminando, setEliminando]       = useState(false);
    const [empresaEditando, setEmpresaEditando] = useState(null);
    const [formEdit, setFormEdit]           = useState({});
    const [guardando, setGuardando]         = useState(false);

    useEffect(() => {
        cargar();
    }, []);

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

    useEffect(() => { setPagina(1); }, [busqueda, filtroEstado]);

    const mostrarMensaje = (texto, tipo = 'exito') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje(null), 4000);
    };

    const abrirConfirmEliminar = (empresa) => setConfirmEliminar(empresa);
    const cerrarConfirmEliminar = () => setConfirmEliminar(null);

    const handleEliminar = async () => {
        if (!confirmEliminar) return;
        setEliminando(true);
        try {
            const res = await fetch(`${API}/${confirmEliminar.idEmpresa}`, { method: 'DELETE' });
            if (res.ok) {
                setEmpresas(prev => prev.filter(e => e.idEmpresa !== confirmEliminar.idEmpresa));
                cerrarConfirmEliminar();
                mostrarMensaje('Se ha eliminado el cliente');
            } else {
                const data = await res.json();
                mostrarMensaje(data.error || 'Error al eliminar el cliente', 'error');
            }
        } catch {
            mostrarMensaje('Error de conexión al eliminar', 'error');
        } finally {
            setEliminando(false);
        }
    };

    const abrirEditar = (empresa) => {
        setEmpresaEditando(empresa);
        setFormEdit({
            razonSocial:    empresa.razonSocial    || '',
            nombreContacto: empresa.nombreContacto || '',
            correo:         empresa.correo         || '',
            celular:        empresa.celular        || '',
            estado:         empresa.estado         || 'Pendiente',
        });
    };

    const cerrarEditar = () => { setEmpresaEditando(null); setFormEdit({}); };

    const handleGuardar = async () => {
        setGuardando(true);
        try {
            const res = await fetch(`${API}/${empresaEditando.idEmpresa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razonSocial:    formEdit.razonSocial,
                    nombreContacto: formEdit.nombreContacto,
                    correo:         formEdit.correo,
                    celular:        formEdit.celular,
                    estado:         formEdit.estado,
                }),
            });
            if (res.ok) {
                setEmpresas(prev => prev.map(e =>
                    e.idEmpresa === empresaEditando.idEmpresa
                        ? { ...e, ...formEdit }
                        : e
                ));
                cerrarEditar();
                mostrarMensaje('Cliente actualizado correctamente');
            } else {
                const data = await res.json();
                mostrarMensaje(data.error || 'Error al actualizar el cliente', 'error');
            }
        } catch {
            mostrarMensaje('Error de conexión al actualizar', 'error');
        } finally {
            setGuardando(false);
        }
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        try {
            const d = new Date(f);
            return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        } catch { return f; }
    };

    const totalClientes   = empresas.length;
    const totalActivos    = empresas.filter(e => esActivo(e.estado)).length;
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
            {/* ── Mensaje toast ── */}
            {mensaje && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    mensaje.tipo === 'exito'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {mensaje.tipo === 'exito'
                        ? <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    }
                    {mensaje.texto}
                </div>
            )}

            {/* ── Modal confirmar eliminar ── */}
            {confirmEliminar && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Eliminar cliente</h3>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={cerrarConfirmEliminar}
                                disabled={eliminando}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEliminar}
                                disabled={eliminando}
                                className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                            >
                                {eliminando ? 'Eliminando…' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal editar ── */}
            {empresaEditando && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Editar cliente</h3>
                            <button onClick={cerrarEditar} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {[
                                { label: 'Razón Social', key: 'razonSocial' },
                                { label: 'Nombre de Contacto', key: 'nombreContacto' },
                                { label: 'Correo', key: 'correo', type: 'email' },
                                { label: 'Celular', key: 'celular' },
                            ].map(({ label, key, type = 'text' }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
                                    <input
                                        type={type}
                                        value={formEdit[key] || ''}
                                        onChange={ev => setFormEdit(f => ({ ...f, [key]: ev.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2540]/20 focus:border-[#1a2540]"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Estado</label>
                                <select
                                    value={formEdit.estado || 'Pendiente'}
                                    onChange={ev => setFormEdit(f => ({ ...f, estado: ev.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2540]/20 focus:border-[#1a2540] bg-white"
                                >
                                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                            <button
                                onClick={cerrarEditar}
                                disabled={guardando}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardar}
                                disabled={guardando}
                                className="flex-1 py-2 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors disabled:opacity-60"
                            >
                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onEditarCliente?.(e)}
                                                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => abrirConfirmEliminar(e)}
                                                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
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
