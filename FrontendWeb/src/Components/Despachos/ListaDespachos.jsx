import { useState, useEffect, useRef } from 'react';

const API     = 'http://localhost:5018/api/Despachos';
const API_DAM = 'http://localhost:5018/api/DAM';

/* ── Badge canal ──────────────────────────────────────────── */
function CanalBadge({ canal }) {
    const map = {
        'Canal Verde':   { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
        'Canal Naranja': { dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
        'Canal Rojo':    { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
    };
    const cfg = map[canal];
    if (!cfg) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Pendiente
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {canal}
        </span>
    );
}

/* ── Modal detalle ────────────────────────────────────────── */
function ModalDetalle({ despacho, onCerrar, onVerLiquidaciones }) {
    const [dam, setDam]             = useState(null);
    const [loadingDam, setLoading]  = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await fetch(`${API_DAM}/${despacho.idDespacho}/borrador`);
                if (res.ok) setDam(await res.json());
            } catch { /* no dam */ }
            finally { setLoading(false); }
        };
        cargar();
    }, [despacho.idDespacho]);

    const fmt = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return f; }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`h-1.5 ${
                    despacho.nombreCanal === 'Canal Verde'   ? 'bg-green-400' :
                    despacho.nombreCanal === 'Canal Naranja' ? 'bg-orange-400' :
                    despacho.nombreCanal === 'Canal Rojo'    ? 'bg-red-400' :
                    'bg-gray-300'
                }`} />
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-bold text-gray-900">{despacho.codigoOrden}</h3>
                            <CanalBadge canal={despacho.nombreCanal} />
                        </div>
                        <p className="text-xs text-gray-500">{despacho.razonSocial}</p>
                    </div>
                    <button onClick={onCerrar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Datos del expediente</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Bill of Lading', value: despacho.codigoBl,          mono: true },
                                { label: 'RUC',            value: despacho.ruc,               mono: true },
                                { label: 'Importador',     value: despacho.razonSocial                   },
                                { label: 'Fecha creación', value: fmt(despacho.fechaCreacion)            },
                                { label: 'ETA',            value: despacho.eta ? fmt(new Date(despacho.eta)) : '—' },
                                { label: 'Estado',         value: despacho.estado || '—'               },
                            ].map(f => (
                                <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{f.label}</p>
                                    <p className={`text-sm font-semibold text-gray-800 truncate ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Liquidación</p>
                        {loadingDam ? (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                <span className="text-xs text-gray-400">Verificando...</span>
                            </div>
                        ) : !dam ? (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">Sin liquidación</p>
                                    <p className="text-xs text-gray-400">Este despacho aún no tiene DAM generada.</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-3 p-4 border rounded-xl ${dam.edicionBloqueada ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dam.edicionBloqueada ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <svg className={`w-4 h-4 ${dam.edicionBloqueada ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {dam.edicionBloqueada
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                                    </svg>
                                </div>
                                <div>
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
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button onClick={onCerrar} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors">Cerrar</button>
                    <button onClick={() => { onCerrar(); onVerLiquidaciones(despacho); }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Ver liquidaciones
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Menú acciones ────────────────────────────────────────── */
function MenuAcciones({ despacho, onDetalle, onVerDetalle, onVerLiquidaciones, onClasificacion, onEliminar, onDocumentacion, onExtraerFactura, onBorradorDAM }) {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const puedeEliminar = despacho.estado !== 'Liquidación Terminada';

    return (
        <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setAbierto(v => !v)}
                className={`p-1.5 rounded-lg transition-colors ${abierto ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
            {abierto && (
                <div className="absolute right-0 top-8 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <button onClick={() => { setAbierto(false); onDetalle(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver resumen
                    </button>
                    {onVerDetalle && (
                        <button onClick={() => { setAbierto(false); onVerDetalle(despacho); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#1a2540] hover:bg-[#f0f4ff] text-left border-t border-gray-50">
                            <svg className="w-4 h-4 text-[#1a2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="font-medium">Ver DAM completa</span>
                        </button>
                    )}
                    <button onClick={() => { setAbierto(false); onClasificacion?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <span className="text-[#008b9c] font-medium">Clasificación arancelaria</span>
                    </button>
                    <button onClick={() => { setAbierto(false); onDocumentacion?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span className="text-[#008b9c] font-medium">Documentación logística</span>
                    </button>
                    <button onClick={() => { setAbierto(false); onExtraerFactura?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="text-[#008b9c] font-medium">Extraer factura</span>
                    </button>
                    <button onClick={() => { setAbierto(false); onBorradorDAM?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[#008b9c] font-medium">Generar borrador DAM</span>
                    </button>
                    <button onClick={() => { setAbierto(false); onVerLiquidaciones?.(despacho); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#e0f7fa] text-left border-t border-gray-50">
                        <svg className="w-4 h-4 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="text-[#008b9c] font-medium">Ver liquidaciones</span>
                    </button>
                    {puedeEliminar && (
                        <button onClick={() => { setAbierto(false); onEliminar(despacho); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Eliminar despacho
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Modal eliminar ───────────────────────────────────────── */
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

/* ── Componente principal ─────────────────────────────────── */
export default function ListaDespachos({ onNuevoDespacho, onVerDetalle, onVerLiquidaciones, onClasificacion, onDocumentacion, onExtraerFactura, onBorradorDAM }) {
    const [despachos, setDespachos]             = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [busqueda, setBusqueda]               = useState('');
    const [busquedaActiva, setBusquedaActiva]   = useState('');
    const [modalDetalle, setModalDetalle]       = useState(null);
    const [modalEliminar, setModalEliminar]     = useState(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const [toast, setToast]                     = useState(null);
    const [paginaActual, setPaginaActual]       = useState(1);
    const ITEMS_POR_PAGINA = 10;

    /* Datos del usuario logueado */
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

    const exportarCSV = () => {
        const headers = ['Código Int.', 'RUC Cliente', 'Cliente', 'Bill of Lading', 'Fecha Arribo', 'Canal', 'Estado'];
        const rows = filtrados.map(d => [
            d.codigoOrden, d.ruc, d.razonSocial, d.codigoBl,
            d.eta ? fmtFecha(d.eta) : '', d.nombreCanal || 'Pendiente', d.estado
        ]);
        const csv = [headers, ...rows]
            .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `historial_despachos_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const eliminar = async () => {
        if (!modalEliminar) return;
        setLoadingEliminar(true);
        try {
            const res  = await fetch(`${API}/${modalEliminar.idDespacho}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setDespachos(prev => prev.filter(d => d.idDespacho !== modalEliminar.idDespacho));
                mostrarToast(`Despacho ${modalEliminar.codigoOrden} eliminado.`);
            } else {
                mostrarToast(data.mensaje || 'Error al eliminar.', 'error');
            }
        } catch { mostrarToast('No se pudo conectar con el servidor.', 'error'); }
        finally { setLoadingEliminar(false); setModalEliminar(null); }
    };

    const mostrarToast = (msg, tipo = 'exito') => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 4000);
    };

    const fmtFecha = (f) => {
        if (!f) return '—';
        try {
            const d = new Date(f);
            return isNaN(d) ? String(f) : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return String(f); }
    };

    /* Filtro por BL o código */
    const filtrados = despachos.filter(d => {
        const q = busquedaActiva.toLowerCase().trim();
        if (!q) return true;
        return d.codigoBl?.toLowerCase().includes(q) || d.codigoOrden?.toLowerCase().includes(q);
    });

    /* Stats */
    const ahora = new Date();
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nuevosEstaSemana = despachos.filter(d => new Date(d.fechaCreacion) >= hace7Dias).length;

    const stats = [
        {
            label: 'TOTAL ACTIVOS',
            value: despachos.length,
            sub: `↑ +${nuevosEstaSemana} esta semana`,
            subColor: 'text-blue-600',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            iconBg: 'bg-blue-50 text-blue-600',
            dot: null,
        },
        {
            label: 'CANAL VERDE',
            value: despachos.filter(d => d.nombreCanal === 'Canal Verde').length,
            sub: 'Liberación automática',
            subColor: 'text-green-600',
            icon: null,
            dot: 'bg-green-500',
        },
        {
            label: 'CANAL NARANJA',
            value: despachos.filter(d => d.nombreCanal === 'Canal Naranja').length,
            sub: 'Revisión documentaria',
            subColor: 'text-orange-500',
            icon: null,
            dot: 'bg-orange-400',
        },
        {
            label: 'CANAL ROJO',
            value: despachos.filter(d => d.nombreCanal === 'Canal Rojo').length,
            sub: 'Inspección física requerida',
            subColor: 'text-red-600',
            icon: null,
            dot: 'bg-red-500',
        },
    ];

    /* Paginación */
    const totalPaginas   = Math.ceil(filtrados.length / ITEMS_POR_PAGINA);
    const inicio         = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const pagina         = filtrados.slice(inicio, inicio + ITEMS_POR_PAGINA);

    const buscar = () => {
        setBusquedaActiva(busqueda);
        setPaginaActual(1);
    };
    const limpiarBusqueda = () => {
        setBusqueda(''); setBusquedaActiva(''); setPaginaActual(1);
    };

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
                    <button onClick={onNuevoDespacho}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-xl hover:bg-[#243050] transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        + Nuevo Despacho
                    </button>
                )}
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map(s => (
                    <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                            {s.icon ? (
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} /></svg>
                                </div>
                            ) : (
                                <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                            )}
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
                        <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Barra de búsqueda y acciones ── */}
            <div className="flex items-center justify-between mb-5 gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                    <div className="relative flex-1">
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
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <button onClick={buscar}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors whitespace-nowrap">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                        Filtros
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        Mostrando {Math.min(inicio + ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length} registros
                    </span>
                    <button onClick={exportarCSV}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Exportar
                    </button>
                    <button onClick={cargar} title="Refrescar"
                        className="p-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-[#1a2540] hover:border-[#1a2540] transition-colors bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {/* ── Tabla ── */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <svg className="w-8 h-8 animate-spin text-[#1a2540]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    </div>
                ) : pagina.length === 0 ? (
                    <div className="py-16 text-center">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-gray-600 font-semibold">
                            {busquedaActiva ? 'No se encontraron resultados' : 'Aún no hay despachos registrados'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {busquedaActiva ? 'Intenta con otro BL o código' : ''}
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
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código Int.</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">RUC Cliente</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill of Lading (BL)</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Arribo</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado Actual</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {pagina.map(d => (
                                <tr key={d.idDespacho}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setModalDetalle(d)}>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-[#1a2540] text-sm">{d.codigoOrden || '—'}</span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-sm text-gray-600">{d.ruc || '—'}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-gray-800 truncate max-w-[160px] block">{d.razonSocial || '—'}</span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-sm text-[#1a2540] font-semibold">{d.codigoBl}</td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {d.eta ? fmtFecha(d.eta) : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <CanalBadge canal={d.nombreCanal} />
                                    </td>
                                    <td className="px-5 py-4 text-center" onClick={e => e.stopPropagation()}>
                                        <MenuAcciones
                                            despacho={d}
                                            onDetalle={() => setModalDetalle(d)}
                                            onVerDetalle={onVerDetalle}
                                            onVerLiquidaciones={onVerLiquidaciones}
                                            onClasificacion={onClasificacion}
                                            onEliminar={setModalEliminar}
                                            onDocumentacion={onDocumentacion}
                                            onExtraerFactura={onExtraerFactura}
                                            onBorradorDAM={onBorradorDAM}
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
                        <p className="text-xs text-gray-500">
                            Página {paginaActual} de {totalPaginas}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                disabled={paginaActual === 1}
                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
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
                                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal detalle */}
            {modalDetalle && (
                <ModalDetalle
                    despacho={modalDetalle}
                    onCerrar={() => setModalDetalle(null)}
                    onVerLiquidaciones={onVerLiquidaciones}
                />
            )}

            {/* Modal eliminar */}
            {modalEliminar && (
                <ModalEliminar
                    despacho={modalEliminar}
                    onConfirmar={eliminar}
                    onCancelar={() => setModalEliminar(null)}
                    loading={loadingEliminar}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 rounded-xl shadow-xl p-4 flex items-start gap-4 z-50 min-w-[300px] border ${toast.tipo === 'exito' ? 'bg-white border-green-100' : 'bg-white border-red-100'}`}>
                    <div className={`p-1.5 rounded-full ${toast.tipo === 'exito' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {toast.tipo === 'exito'
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                    <p className="text-sm text-gray-700 font-medium flex-1">{toast.msg}</p>
                    <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
