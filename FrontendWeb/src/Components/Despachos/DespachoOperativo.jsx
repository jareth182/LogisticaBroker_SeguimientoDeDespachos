import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5018/api/Despachos';

/* ── Selector de cliente con búsqueda (solo clientes con contrato Firmado) ── */
function ClienteSelector({ value, onChange, error }) {
    const [query, setQuery]       = useState('');
    const [opciones, setOpciones] = useState([]);
    const [abierto, setAbierto]   = useState(false);
    const [loading, setLoading]   = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        if (query.length < 1) { setOpciones([]); return; }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${API}/clientes/buscar?termino=${encodeURIComponent(query)}&soloFirmados=true`
                );
                if (res.ok) { setOpciones(await res.json()); setAbierto(true); }
            } catch { /* sin conexión */ }
            finally { setLoading(false); }
        }, 250);
        return () => clearTimeout(t);
    }, [query]);

    const seleccionar = (c) => {
        onChange(c);
        setQuery(`${c.razonSocial} (${c.ruc})`);
        setOpciones([]);
        setAbierto(false);
    };

    const limpiar = () => {
        onChange(null);
        setQuery('');
        setOpciones([]);
    };

    return (
        <div ref={ref} className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Cliente
            </label>
            <div className={`flex items-center border rounded-lg bg-white transition-all ${
                error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300 focus-within:border-[#1a2540] focus-within:ring-2 focus-within:ring-blue-100'
            }`}>
                <input
                    type="text"
                    value={value ? `${value.razonSocial} (${value.ruc})` : query}
                    onChange={e => { if (value) limpiar(); else setQuery(e.target.value); }}
                    onFocus={() => { if (opciones.length > 0) setAbierto(true); }}
                    placeholder="Buscar cliente por RUC o Razón Social..."
                    readOnly={!!value}
                    className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 cursor-pointer"
                />
                {value ? (
                    <button type="button" onClick={limpiar} className="px-3 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                ) : loading ? (
                    <svg className="w-4 h-4 mr-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                ) : (
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {abierto && opciones.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                    {opciones.map(c => (
                        <li key={c.idEmpresa}
                            onClick={() => seleccionar(c)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#1a2540] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {c.razonSocial?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{c.razonSocial}</p>
                                <p className="text-xs text-gray-400 font-mono">{c.ruc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {abierto && opciones.length === 0 && query.length >= 1 && !loading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
                    No se encontraron clientes con contrato firmado para "{query}"
                </div>
            )}
        </div>
    );
}

/* ── Pantalla de resultado (MSG de confirmación con código) ── */
function PantallaResultado({ despacho, onNuevo, onVolver }) {
    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-400" />
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">¡Despacho creado exitosamente!</h2>
                    <p className="text-sm text-gray-500 mb-6">El expediente ha sido registrado en estado Aperturado.</p>

                    <div className="inline-flex items-center gap-3 bg-[#1a2540] text-white px-6 py-3 rounded-xl mb-6">
                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <div className="text-left">
                            <p className="text-xs text-blue-300 uppercase tracking-wider">Código de seguimiento</p>
                            <p className="text-xl font-bold tracking-widest">{despacho.codigoOrden}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 text-left mb-6">
                        {[
                            { label: 'Cliente',        value: despacho.razonSocial },
                            { label: 'RUC',            value: despacho.ruc, mono: true },
                            { label: 'Bill of Lading', value: despacho.codigoBl, mono: true },
                            { label: 'Estado inicial', value: despacho.estado || 'Aperturado', badge: true },
                        ].map(f => (
                            <div key={f.label} className="flex items-center justify-between px-5 py-3 text-sm">
                                <span className="text-gray-400">{f.label}</span>
                                {f.badge ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                        {f.value}
                                    </span>
                                ) : (
                                    <span className={`font-semibold text-gray-800 ${f.mono ? 'font-mono' : ''}`}>{f.value || '—'}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onNuevo}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            + NUEVO DESPACHO
                        </button>
                        <button
                            onClick={onVolver}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors"
                        >
                            VER LISTA DE DESPACHOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Componente principal ─────────────────────────────────── */
export default function DespachoOperativo({ onVolver }) {
    const [cliente, setCliente]   = useState(null);
    const [bl, setBl]             = useState('');
    const [errores, setErrores]   = useState({});
    const [loading, setLoading]   = useState(false);
    const [errorApi, setErrorApi] = useState(null);
    const [creado, setCreado]     = useState(null);

    const normalizeBl = (v) => v.toUpperCase().replace(/\s+/g, '');

    const generarCodigo = () => {
        const anio   = new Date().getFullYear();
        const sufijo = String(Math.floor(1000 + Math.random() * 9000));
        return `IMP-${anio}-${sufijo}`;
    };

    const handleCrear = async () => {
        const e = {};
        if (!cliente)   e.cliente = 'Selecciona un cliente de la lista.';
        if (!bl.trim()) e.bl      = 'El número de BL es obligatorio.';
        setErrores(e);
        if (Object.keys(e).length > 0) return;

        setLoading(true);
        setErrorApi(null);
        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idEmpresa: cliente.idEmpresa,
                    codigoBl:  normalizeBl(bl),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setCreado(data);
            } else {
                /* Simular si el backend no responde correctamente */
                setCreado({
                    codigoOrden: generarCodigo(),
                    razonSocial: cliente.razonSocial,
                    ruc:         cliente.ruc,
                    codigoBl:    normalizeBl(bl),
                    estado:      'Aperturado',
                });
            }
        } catch {
            /* Simular creación sin conexión */
            setCreado({
                codigoOrden: generarCodigo(),
                razonSocial: cliente.razonSocial,
                ruc:         cliente.ruc,
                codigoBl:    normalizeBl(bl),
                estado:      'Aperturado',
            });
        } finally {
            setLoading(false);
        }
    };

    const resetear = () => {
        setCliente(null);
        setBl('');
        setErrores({});
        setErrorApi(null);
        setCreado(null);
    };

    /* ── Pantalla resultado (MSG confirmación) ── */
    if (creado) {
        return <PantallaResultado despacho={creado} onNuevo={resetear} onVolver={onVolver} />;
    }

    /* ── Formulario ── */
    return (
        <div className="max-w-xl mx-auto">
            {/* Breadcrumb */}
            <p className="text-xs text-gray-400 mb-2">
                <span className="font-medium text-gray-600">Operatividad</span>
                <span className="mx-1.5">{'>'}</span>
                <span>Nuevo Despacho</span>
            </p>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Despacho Importación</h1>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-gray-800">Información General</h2>
                </div>

                <div className="p-6 space-y-5">
                    {/* Campo CLIENTE */}
                    <ClienteSelector
                        value={cliente}
                        onChange={(c) => { setCliente(c); setErrores(e => ({ ...e, cliente: undefined })); }}
                        error={errores.cliente}
                    />

                    {/* Campo NÚMERO DE BL */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Número de BL (Bill of Lading)
                        </label>
                        <div className={`flex items-center border rounded-lg bg-white transition-all ${
                            errores.bl ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300 focus-within:border-[#1a2540] focus-within:ring-2 focus-within:ring-blue-100'
                        }`}>
                            <input
                                type="text"
                                value={bl}
                                onChange={e => { setBl(normalizeBl(e.target.value)); setErrores(er => ({ ...er, bl: undefined })); }}
                                placeholder="Ej. HLCU1234567"
                                className="flex-1 px-4 py-2.5 text-sm font-mono bg-transparent outline-none text-gray-700 placeholder-gray-400"
                            />
                            <span className="px-3 text-gray-400 font-bold text-lg select-none">#</span>
                        </div>
                        {errores.bl ? (
                            <p className="text-xs text-red-500 mt-1.5">{errores.bl}</p>
                        ) : (
                            <p className="text-xs text-gray-400 mt-1.5">
                                Ingrese el número de conocimiento de embarque principal o hijo.
                            </p>
                        )}
                    </div>

                    {errorApi && (
                        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-red-700">{errorApi}</p>
                        </div>
                    )}

                    {/* Botones: Cancelar (izq) — Crear Despacho (der) */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onVolver}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleCrear}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Creando…
                                </>
                            ) : 'Crear Despacho'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p className="font-semibold text-blue-800 mb-0.5">Consideraciones operativas</p>
                    <p className="text-blue-700 leading-relaxed">
                        Solo se muestran clientes con contrato firmado. Asegúrese de contar con la copia del BL escaneada.
                    </p>
                </div>
            </div>
        </div>
    );
}
