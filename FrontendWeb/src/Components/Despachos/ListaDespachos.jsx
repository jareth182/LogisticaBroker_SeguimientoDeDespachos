import { useState, useEffect, useRef } from 'react';

const API     = 'http://localhost:5018/api/Despachos';
const API_DAM = 'http://localhost:5018/api/DAM';

function EstadoBadge({ estado }) {
    const cfg = {
        'En Apertura':           { dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
        'En proceso':            { dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
        'Liquidación Terminada': { dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  },
        'En Revisión':           { dot: 'bg-purple-400', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        'Pend. Pago':            { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
        'Validado':              { dot: 'bg-teal-400',   text: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200'   },
    }[estado] || { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {estado || 'Sin estado'}
        </span>
    );
}

function Avatar({ nombre }) {
    const iniciales = nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
    const colors = ['bg-[#008b9c]', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500'];
    return (
        <div className={`w-9 h-9 ${colors[iniciales.charCodeAt(0) % colors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {iniciales}
        </div>
    );
}

// ── Modal de detalle del despacho ─────────────────────────────
function ModalDetalleDespacho({ despacho, onCerrar, onVerLiquidaciones }) {
    const [dam, setDam]         = useState(null);
    const [loadingDam, setLoadingDam] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch(`${API_DAM}/${despacho.idDespacho}/borrador`);
                if (res.ok) setDam(await res.json());
                else setDam(null);
            } catch { setDam(null); }
            finally { setLoadingDam(false); }
        };
        cargar();
    }, [despacho.idDespacho]);

    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return f; }
    };

    const formatEta = (eta) => {
        if (!eta) return '—';
        try {
            const d = new Date(eta);
            return isNaN(d) ? eta : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return eta; }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Strip color */}
                <div className={`h-1.5 ${
                    despacho.estado === 'En Apertura' ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                    despacho.estado === 'Liquidación Terminada' ? 'bg-gradient-to-r from-green-400 to-teal-400' :
                    'bg-gradient-to-r from-[#008b9c] to-[#00b4d8]'
                }`} />

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-gray-900">{despacho.codigoOrden}</h3>
                            <EstadoBadge estado={despacho.estado} />
                        </div>
                        <p className="text-xs text-gray-500">{despacho.razonSocial}</p>
                    </div>
                    <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

                    {/* Datos del despacho */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Datos del expediente</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Bill of Lading', value: despacho.codigoBl,              mono: true },
                                { label: 'RUC',            value: despacho.ruc,                   mono: true },
                                { label: 'Importador',     value: despacho.razonSocial                       },
                                { label: 'Fecha creación', value: formatFecha(despacho.fechaCreacion)         },
                                { label: 'ETA',            value: formatEta(despacho.eta)                    },
                                { label: 'Origen',         value: despacho.origen || '—'                     },
                            ].map(f => (
                                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{f.label}</p>
                                    <p className={`text-sm font-semibold text-gray-800 truncate ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estado de liquidación */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado de liquidación</p>
                        {loadingDam ? (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                <span className="text-xs text-gray-400">Verificando liquidación...</span>
                            </div>
                        ) : !dam ? (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Sin liquidación</p>
                                    <p className="text-xs text-gray-400">Este despacho aún no tiene DAM generada.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-3 p-4 border rounded-xl ${dam.edicionBloqueada ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dam.edicionBloqueada ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <svg className={`w-4 h-4 ${dam.edicionBloqueada ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {dam.edicionBloqueada
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        }
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold ${dam.edicionBloqueada ? 'text-green-800' : 'text-blue-800'}`}>
                                        DAM #{dam.idDam} — {dam.edicionBloqueada ? 'Liquidación Oficial' : 'Borrador en progreso'}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${dam.edicionBloqueada ? 'text-green-600' : 'text-blue-600'}`}>
                                        Valor CIF: $ {(dam.valorCifTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onCerrar}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                        Cerrar
                    </button>
                    <button
                        onClick={() => { onCerrar(); onVerLiquidaciones(despacho); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Ver liquidaciones
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Menú tuerca ───────────────────────────────────────────────
function MenuOpciones({ despacho, onVerDetalle, onVerLiquidaciones, onClasificacion, onEliminar }) {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const puedeEliminar = despacho.estado !== 'Liquidación Terminada';

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setAbierto(v => !v)}
                className={`p-1.5 rounded-lg transition-colors ${abierto ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {abierto && (
                <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <button onClick={() => { setAbierto(false); onVerDetalle(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver detalle
                    </button>
                    <button onClick={() => { setAbierto(false); onClasificacion?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] transition-colors text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-[#008b9c] font-medium">Clasificación arancelaria</span>
                    </button>

                    <button onClick={() => { setAbierto(false); onVerLiquidaciones?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] transition-colors text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-[#008b9c] font-medium">Ver liquidaciones</span>
                    </button>
                    <button onClick={() => { setAbierto(false); onEliminar(despacho); }} disabled={!puedeEliminar}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-t border-gray-100 ${puedeEliminar ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {puedeEliminar ? 'Eliminar despacho' : 'No se puede eliminar'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Modal eliminar ────────────────────────────────────────────
function ModalEliminar({ despacho, onConfirmar, onCancelar, loading }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Eliminar despacho</h3>
                        <p className="text-sm text-gray-500 mt-1">¿Estás seguro de eliminar <span className="font-bold text-gray-800">{despacho.codigoOrden}</span>? Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-xs text-amber-700">Se eliminarán también las partidas arancelarias y DAM asociadas.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancelar} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button onClick={onConfirmar} disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Eliminando...</> : 'Sí, eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ListaDespachos({ onNuevoDespacho, onVerLiquidaciones, onClasificacion }) {
    const [despachos, setDespachos]             = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [busqueda, setBusqueda]               = useState('');
    const [filtroEstado, setFiltroEstado]       = useState('Todos');
    const [vista, setVista]                     = useState('grid');
    const [modalEliminar, setModalEliminar]     = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const [toast, setToast]                     = useState(null);
    const [modalDetalle, setModalDetalle]       = useState(null);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await fetch(API);
            if (res.ok) setDespachos(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, []);

    const mostrarToast = (msg, tipo = 'exito') => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 4000);
    };

    const handleEliminar = async () => {
        if (!modalEliminar) return;
        setLoadingEliminar(true);
        try {
            const res = await fetch(`${API}/${modalEliminar.idDespacho}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setDespachos(prev => prev.filter(d => d.idDespacho !== modalEliminar.idDespacho));
                mostrarToast(`Despacho ${modalEliminar.codigoOrden} eliminado correctamente.`);
            } else {
                mostrarToast(data.mensaje || 'Error al eliminar.', 'error');
            }
        } catch { mostrarToast('No se pudo conectar con el servidor.', 'error'); }
        finally { setLoadingEliminar(false); setModalEliminar(null); }
    };

    const filtrados = despachos.filter(d => {
        const q = busqueda.toLowerCase();
        const matchQ = !q || d.codigoOrden?.toLowerCase().includes(q) ||
            d.razonSocial?.toLowerCase().includes(q) || d.codigoBl?.toLowerCase().includes(q) || d.ruc?.includes(q);
        return matchQ && (filtroEstado === 'Todos' || d.estado === filtroEstado);
    });

    const stats = {
        total:      despachos.length,
        apertura:   despachos.filter(d => d.estado === 'En Apertura').length,
        proceso:    despachos.filter(d => d.estado === 'En proceso').length,
        terminados: despachos.filter(d => d.estado === 'Liquidación Terminada').length,
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return f; }
    };

    const formatEta = (eta) => {
        if (!eta) return null;
        try { const d = new Date(eta); return isNaN(d) ? eta : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return eta; }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Despachos</h1>
                    <p className="text-sm text-gray-500 mt-1">Expedientes de importación registrados en el sistema</p>
                </div>
                <button onClick={onNuevoDespacho}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-xl hover:bg-[#007685] transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Crear Despacho
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total despachos', value: stats.total,      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-[#008b9c] bg-[#e0f7fa]' },
                    { label: 'En Apertura',     value: stats.apertura,   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                                              color: 'text-orange-600 bg-orange-50'  },
                    { label: 'En Proceso',      value: stats.proceso,    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',            color: 'text-blue-600 bg-blue-50'      },
                    { label: 'Terminados',      value: stats.terminados, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',                                                                            color: 'text-green-600 bg-green-50'    },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} /></svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por código, importador, BL o RUC..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c]" />
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    {['Todos', 'En Apertura', 'En proceso', 'Liquidación Terminada'].map(f => (
                        <button key={f} onClick={() => setFiltroEstado(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${filtroEstado === f ? 'bg-[#008b9c] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    <button onClick={() => setVista('grid')} className={`p-1.5 rounded-lg transition-colors ${vista === 'grid' ? 'bg-[#008b9c] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button onClick={() => setVista('tabla')} className={`p-1.5 rounded-lg transition-colors ${vista === 'tabla' ? 'bg-[#008b9c] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                </div>
                <button onClick={cargar} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#008b9c] hover:border-[#008b9c] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <svg className="w-8 h-8 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                </div>
            ) : filtrados.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-gray-600 font-semibold">{busqueda || filtroEstado !== 'Todos' ? 'No se encontraron resultados' : 'Aún no hay despachos registrados'}</p>
                    <p className="text-sm text-gray-400 mt-1">{busqueda || filtroEstado !== 'Todos' ? 'Intenta con otros filtros' : 'Haz clic en "Nuevo Despacho" para registrar el primero'}</p>
                    {!busqueda && filtroEstado === 'Todos' && (
                        <button onClick={onNuevoDespacho} className="mt-4 px-4 py-2 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors">+ Nuevo Despacho</button>
                    )}
                </div>
            ) : vista === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtrados.map(d => (
                        <div key={d.idDespacho}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-visible group">
                            <div className={`h-1.5 rounded-t-xl ${
                                d.estado === 'En Apertura' ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                                d.estado === 'En proceso'  ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                                d.estado === 'Liquidación Terminada' ? 'bg-gradient-to-r from-green-400 to-teal-400' :
                                'bg-gradient-to-r from-[#008b9c] to-[#00b4d8]'
                            }`} />
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar nombre={d.razonSocial} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#008b9c]">{d.codigoOrden}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[130px]">{d.razonSocial}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <EstadoBadge estado={d.estado} />
                                        <MenuOpciones
                                            despacho={d}
                                            onVerDetalle={() => setModalDetalle(d)}
                                            onVerLiquidaciones={onVerLiquidaciones}
                                            onEliminar={setModalEliminar}
                                            onClasificacion={onClasificacion}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span className="font-mono font-semibold text-gray-700">{d.codigoBl}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                                        <span className="font-mono text-gray-500">{d.ruc}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className={formatEta(d.eta) ? 'text-gray-600' : 'text-gray-300'}>
                                            ETA: {formatEta(d.eta) || 'Sin fecha'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400">Creado {formatFecha(d.fechaCreacion)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-4">Código</th>
                                <th className="px-5 py-4">Importador</th>
                                <th className="px-5 py-4">BL</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4">Fecha Estimada de Arribo</th>
                                <th className="px-5 py-4">Creación</th>
                                <th className="px-5 py-4 text-center">Opciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filtrados.map(d => (
                                <tr key={d.idDespacho} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4 font-bold text-[#008b9c]">{d.codigoOrden}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar nombre={d.razonSocial} />
                                            <div>
                                                <p className="font-semibold text-gray-800 truncate max-w-[140px]">{d.razonSocial}</p>
                                                <p className="text-xs text-gray-400 font-mono">{d.ruc}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-gray-600 text-xs">{d.codigoBl}</td>
                                    <td className="px-5 py-4"><EstadoBadge estado={d.estado} /></td>
                                    <td className="px-5 py-4 text-xs text-gray-500">
                                        {formatEta(d.eta) ? <span className="flex items-center gap-1"><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{formatEta(d.eta)}</span> : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">{formatFecha(d.fechaCreacion)}</td>
                                    <td className="px-5 py-4 text-center">
                                        <MenuOpciones
                                            despacho={d}
                                            onVerDetalle={() => setModalDetalle(d)}
                                            onVerLiquidaciones={onVerLiquidaciones}
                                            onEliminar={setModalEliminar}
                                               onClasificacion={onClasificacion}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                        Mostrando {filtrados.length} de {despachos.length} despachos
                    </div>
                </div>
            )}

            {/* Modal detalle despacho */}
            {modalDetalle && (
                <ModalDetalleDespacho
                    despacho={modalDetalle}
                    onCerrar={() => setModalDetalle(null)}
                    onVerLiquidaciones={onVerLiquidaciones}
                />
            )}

            {/* Modal eliminar */}
            {modalEliminar && (
                <ModalEliminar
                    despacho={modalEliminar}
                    onConfirmar={handleEliminar}
                    onCancelar={() => setModalEliminar(null)}
                    loading={loadingEliminar}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 rounded-xl shadow-xl p-4 flex items-start gap-4 z-50 min-w-[320px] border ${toast.tipo === 'exito' ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
                    <div className={`p-1.5 rounded-full ${toast.tipo === 'exito' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {toast.tipo === 'exito' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                    <p className="text-sm text-gray-700 font-medium flex-1">{toast.msg}</p>
                    <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}