import { useState, useEffect } from 'react';

const API_DESPACHOS = 'http://localhost:5018/api/Despachos';

function StepIndicator({ paso }) {
    const pasos = [
        { id: 1, label: 'Datos generales',  sub: 'Ingresa la información'    },
        { id: 2, label: 'Confirmación',      sub: 'Revisa y edita los datos'  },
        { id: 3, label: 'Resultado',         sub: 'Despacho creado'           },
    ];
    return (
        <div className="flex items-center gap-0 mb-8">
            {pasos.map((p, i) => {
                const activo   = paso === p.id;
                const completo = paso > p.id;
                return (
                    <div key={p.id} className="flex items-center">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                                completo ? 'bg-[#008b9c] text-white' :
                                activo   ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' :
                                           'bg-gray-100 text-gray-400 border-2 border-gray-200'
                            }`}>
                                {completo ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : p.id}
                            </div>
                            <div>
                                <p className={`text-xs font-bold leading-tight ${activo || completo ? 'text-[#008b9c]' : 'text-gray-400'}`}>{p.label}</p>
                                <p className="text-[10px] text-gray-400">{p.sub}</p>
                            </div>
                        </div>
                        {i < pasos.length - 1 && (
                            <div className={`w-16 h-0.5 mx-4 transition-all duration-500 ${completo ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function EstadoBadge({ estado }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {estado || 'En Apertura'}
        </span>
    );
}

function CampoEditable({ label, value, onChange, placeholder, mono = false, type = 'text' }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] bg-white transition-all ${mono ? 'font-mono' : ''}`} />
        </div>
    );
}

export default function DespachoOperativo({ onVerDetalle, onVolver }) {
    const [paso, setPaso] = useState(1);

    const [busqueda, setBusqueda]             = useState('');
    const [clientes, setClientes]             = useState([]);
    const [clienteSeleccionado, setClienteSel] = useState(null);
    const [codigoBl, setCodigoBl]             = useState('');
    const [eta, setEta]                       = useState('');
    const [observaciones, setObservaciones]   = useState('');
    const [errores, setErrores]               = useState({});

    const [confRazonSocial, setConfRazonSocial] = useState('');
    const [confRuc, setConfRuc]                 = useState('');
    const [confBl, setConfBl]                   = useState('');
    const [confEta, setConfEta]                 = useState('');
    const [confObs, setConfObs]                 = useState('');

    const [despachoCreado, setDespachoCreado] = useState(null);
    const [loading, setLoading]               = useState(false);
    const [errorApi, setErrorApi]             = useState(null);
    const [toastVisible, setToastVisible]     = useState(false);

    useEffect(() => {
        if (busqueda.length < 1) { setClientes([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_DESPACHOS}/clientes/buscar?termino=${encodeURIComponent(busqueda)}`);
                if (res.ok) setClientes(await res.json());
            } catch (e) { console.error(e); }
        }, 250);
        return () => clearTimeout(timer);
    }, [busqueda]);

    const seleccionarCliente = (c) => {
        setClienteSel(c);
        setBusqueda(`${c.razonSocial} (${c.ruc})`);
        setClientes([]);
        setErrores(e => ({ ...e, cliente: undefined }));
    };

    const normalizeBl = (bl) => (bl || '').toUpperCase().replace(/\s+/g, '');
    const isValidBl = (bl) => /^[A-Z]{4}\d{7}$/.test(normalizeBl(bl));
    const blProgress = (bl) => {
        const normalized = normalizeBl(bl);
        const letters = (normalized.match(/[A-Z]/g) || []).length;
        const digits = (normalized.match(/\d/g) || []).length;
        return { letters, digits, normalized };
    };

    const handleSiguiente = () => {
        const e = {};
        if (!clienteSeleccionado)      e.cliente = 'Selecciona un cliente de la lista';
        if (!codigoBl)                 e.bl = 'El BL es obligatorio';
        else if (!isValidBl(codigoBl)) {
            const { letters, digits } = blProgress(codigoBl);
            e.bl = `Formato inválido. Debe ser 4 letras + 7 dígitos (ej. MSCU1234567). Letras ${letters}/4, dígitos ${digits}/7.`;
        }
        setErrores(e);
        if (Object.keys(e).length > 0) return;
        setConfRazonSocial(clienteSeleccionado.razonSocial);
        setConfRuc(clienteSeleccionado.ruc);
        setConfBl(codigoBl.trim().toUpperCase());
        setConfEta(eta);
        setConfObs(observaciones);
        setPaso(2);
    };

    const handleConfirmar = async () => {
        setLoading(true);
        setErrorApi(null);
        try {
            const res = await fetch(API_DESPACHOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idEmpresa: clienteSeleccionado.idEmpresa, codigoBl: confBl.trim().toUpperCase(), eta: confEta || null, mercancia: confObs || null })
            });
            const data = await res.json();
            if (res.ok) {
                setDespachoCreado(data); setPaso(3);
                setToastVisible(true); setTimeout(() => setToastVisible(false), 5000);
            } else { setErrorApi(data.mensaje || 'Error al crear el despacho.'); }
        } catch { setErrorApi('No se pudo conectar con el servidor.'); }
        finally { setLoading(false); }
    };

    const handleLimpiar = () => {
        setBusqueda(''); setClientes([]); setClienteSel(null);
        setCodigoBl(''); setEta(''); setObservaciones('');
        setErrores({}); setErrorApi(null); setDespachoCreado(null); setPaso(1);
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        try { return new Date(f).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return f; }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Despachos</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Nuevo Despacho</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Despacho de Importación</h1>
                    <p className="text-sm text-gray-500 mt-1">Registra un nuevo expediente para iniciar el proceso operativo.</p>
                </div>
                <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Volver
                </button>
            </div>

            <StepIndicator paso={paso} />

            {/* ── PASO 1 ── */}
            {paso === 1 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">1</div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Datos del nuevo despacho</p>
                            <p className="text-xs text-gray-400">Completa la información para crear el expediente.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Cliente */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
                            <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setClienteSel(null); }}
                                placeholder="Buscar por RUC o Razón Social..."
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${errores.cliente ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]'}`} />
                            {clienteSeleccionado && <p className="text-xs text-[#008b9c] mt-1 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>Cliente seleccionado correctamente</p>}
                            {errores.cliente && <p className="text-xs text-red-500 mt-1">{errores.cliente}</p>}
                            {clientes.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                    {clientes.map(c => (
                                        <li key={c.idEmpresa} onClick={() => seleccionarCliente(c)} className="px-4 py-3 hover:bg-[#e0f7fa] cursor-pointer border-b border-gray-50 last:border-0">
                                            <p className="text-sm font-semibold text-gray-800">{c.razonSocial}</p>
                                            <p className="text-xs text-gray-400">{c.ruc}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* BL */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bill of Lading (BL) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type="text" value={codigoBl} onChange={e => { setCodigoBl(normalizeBl(e.target.value)); setErrores(er => ({ ...er, bl: undefined })); }}
                                    placeholder="Ej. COSU6384765890"
                                    className={`w-full px-4 py-2.5 border rounded-lg text-sm font-mono outline-none transition-all ${errores.bl ? 'border-red-300 bg-red-50' : codigoBl && isValidBl(codigoBl) ? 'border-green-300 bg-green-50' : 'border-gray-300 focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]'}`} />
                                {codigoBl && isValidBl(codigoBl) && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg></span>}
                            </div>
                            {errores.bl ? (
                                <p className="text-xs text-red-500 mt-1">{errores.bl}</p>
                            ) : codigoBl && !isValidBl(codigoBl) ? (
                                <p className="text-xs text-amber-600 mt-1">
                                    Progreso: letras {blProgress(codigoBl).letters}/4, dígitos {blProgress(codigoBl).digits}/7.
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-1">Ingresa el número de BL exactamente como figura en el documento.</p>
                            )}
                        </div>
                        {/* ETA */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha estimada de arribo</label>
                            <input type="date" value={eta} onChange={e => setEta(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] text-gray-600" />
                        </div>
                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones (opcional)</label>
                            <textarea rows="3" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Observaciones adicionales del despacho..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] resize-none" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleLimpiar} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Limpiar
                            </button>
                            <button onClick={handleSiguiente} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm">
                                Siguiente
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PASO 2 ── */}
            {paso === 2 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">2</div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Confirmación de creación</p>
                            <p className="text-xs text-gray-400">Revisa y edita los datos antes de confirmar.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="p-3 bg-[#f0fdfa] border border-[#99f6e4] rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#008b9c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm text-[#0f766e]">Puedes editar cualquier campo antes de confirmar la creación del expediente.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <CampoEditable label="Razón Social" value={confRazonSocial} onChange={setConfRazonSocial} placeholder="Razón social" />
                            <CampoEditable label="RUC" value={confRuc} onChange={setConfRuc} placeholder="RUC" mono />
                        </div>
                        <CampoEditable label="Bill of Lading (BL)" value={confBl} onChange={setConfBl} placeholder="XXXX0000000" mono />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha estimada de arribo</label>
                                <input type="date" value={confEta} onChange={e => setConfEta(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] text-gray-600" />
                            </div>
                            <CampoEditable label="Observaciones" value={confObs} onChange={setConfObs} placeholder="Opcional" />
                        </div>
                        {errorApi && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {errorApi}
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setPaso(1); setErrorApi(null); }} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                Volver
                            </button>
                            <button onClick={handleConfirmar} disabled={loading}
                                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Creando...</> : <>Confirmar y Crear Despacho <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PASO 3 ── */}
            {paso === 3 && despachoCreado && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">3</div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Resultado</p>
                            <p className="text-xs text-gray-400">El expediente ha sido creado correctamente.</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800">¡Despacho creado exitosamente!</p>
                                <p className="text-xs text-green-600 mt-0.5">El sistema ha generado el expediente y lo ha registrado con éxito.</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Código de seguimiento</span>
                                <span className="text-xl font-bold text-[#008b9c]">{despachoCreado.codigoOrden}</span>
                            </div>
                            {[
                                { label: 'Cliente',        value: despachoCreado.razonSocial || confRazonSocial },
                                { label: 'RUC',            value: despachoCreado.ruc || confRuc, mono: true },
                                { label: 'Bill of Lading', value: despachoCreado.codigoBl,       mono: true },
                                { label: 'Fecha creación', value: formatFecha(despachoCreado.fechaCreacion) },
                            ].map(f => (
                                <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 text-sm">
                                    <span className="text-gray-400">{f.label}</span>
                                    <span className={`font-semibold text-gray-800 ${f.mono ? 'font-mono' : ''}`}>{f.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-1 text-sm">
                                <span className="text-gray-400">Estado inicial</span>
                                <EstadoBadge estado={despachoCreado.estado || 'En Apertura'} />
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-xs text-blue-700">El expediente se encuentra en estado "En Apertura". Puedes continuar cargando la documentación desde el detalle.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleLimpiar} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Nuevo despacho
                            </button>
                            <button onClick={onVolver} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                Ver lista de despachos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastVisible && despachoCreado && (
                <div className="fixed bottom-6 right-6 bg-white border border-green-100 rounded-xl shadow-xl p-4 flex items-start gap-4 z-50 min-w-[340px]">
                    <div className="bg-green-100 p-1.5 rounded-full text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">Despacho registrado correctamente</h4>
                        <p className="text-xs text-gray-500 mt-0.5">El expediente {despachoCreado.codigoOrden} ha sido creado en estado "En Apertura".</p>
                    </div>
                    <button onClick={() => setToastVisible(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}