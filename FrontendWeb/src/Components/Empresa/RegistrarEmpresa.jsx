import { useState } from 'react';

const API = 'http://localhost:5018/api/Empresa/registrar';

export default function RegistrarEmpresa({ onVolver }) {
    const [ruc, setRuc]             = useState('');
    const [razonSocial, setRazonSocial] = useState('');
    const [correo, setCorreo]       = useState('');
    const [telefono, setTelefono]   = useState('');

    const [errores, setErrores]     = useState({});
    const [loading, setLoading]     = useState(false);
    const [errorApi, setErrorApi]   = useState('');
    const [resultado, setResultado] = useState(null);
    const [toast, setToast]         = useState(false);
    const [validandoRuc, setValidandoRuc] = useState(false);

    // ── Validación ────────────────────────────────────────────
    const validar = () => {
        const e = {};
        if (!ruc.trim())                        e.ruc = 'El RUC es obligatorio';
        else if (!/^\d{11}$/.test(ruc.trim()))  e.ruc = 'El RUC debe tener 11 dígitos';
        if (!razonSocial.trim())                e.razonSocial = 'La razón social es obligatoria';
        if (!correo.trim())                     e.correo = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.correo = 'Formato de correo inválido';
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    // ── Validar SUNAT (placeholder) ───────────────────────────
    const handleValidarSunat = async () => {
        if (!ruc.trim() || !/^\d{11}$/.test(ruc.trim())) {
            setErrores(prev => ({ ...prev, ruc: 'Ingresa un RUC de 11 dígitos para validar' }));
            return;
        }
        setValidandoRuc(true);
        await new Promise(r => setTimeout(r, 800));
        setValidandoRuc(false);
        setErrores(prev => { const copy = { ...prev }; delete copy.ruc; return copy; });
    };

    // ── Submit ────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        setErrorApi('');

        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ruc:            ruc.trim(),
                    razonSocial:    razonSocial.trim(),
                    nombreContacto: razonSocial.trim(),
                    correo:         correo.trim(),
                    celular:        telefono.trim() || null,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResultado(data);
                setToast(true);
                setTimeout(() => setToast(false), 5000);
            } else {
                setErrorApi(data.error || data.mensaje || 'Error al registrar el cliente.');
            }
        } catch {
            setErrorApi('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    // ── Pantalla de éxito ─────────────────────────────────────
    if (resultado) {
        return (
            <div className="max-w-2xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <button onClick={onVolver} className="hover:text-gray-700 transition-colors">Administración</button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">Nuevo Cliente</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Cliente registrado exitosamente</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Se han enviado las credenciales de acceso a <span className="font-semibold text-gray-700">{resultado.correo}</span>
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">RUC</span><span className="font-semibold font-mono">{resultado.ruc}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Razón Social</span><span className="font-semibold">{resultado.razonSocial}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Usuario generado</span><span className="font-mono font-semibold">{resultado.usuarioGenerado}</span></div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Estado</span>
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pendiente de formalización</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setResultado(null); setRuc(''); setRazonSocial(''); setCorreo(''); setTelefono(''); }}
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Registrar otro cliente
                        </button>
                        <button
                            onClick={onVolver}
                            className="flex-1 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors"
                        >
                            Ver directorio de clientes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-gray-700 transition-colors">Administración</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 font-medium">Nuevo Cliente</span>
            </div>

            {/* Título */}
            <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Cuenta Cliente</h1>
            </div>
            <p className="text-sm text-gray-500 mb-6 ml-11">
                Ingresa los datos fiscales y de contacto para dar de alta a un nuevo cliente en el sistema.
            </p>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

                    {/* ── Sección: Datos Fiscales ── */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-4">Datos Fiscales</h2>

                        {/* RUC */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                RUC <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={ruc}
                                        onChange={e => setRuc(e.target.value.replace(/\D/g,'').slice(0,11))}
                                        placeholder="1845... o 205..."
                                        maxLength={11}
                                        className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                            errores.ruc
                                                ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                        }`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleValidarSunat}
                                    disabled={validandoRuc}
                                    className="px-4 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60 whitespace-nowrap"
                                >
                                    {validandoRuc ? 'Validando...' : 'Validar SUNAT'}
                                </button>
                            </div>
                            {errores.ruc && <p className="text-xs text-red-500 mt-1">{errores.ruc}</p>}
                        </div>

                        {/* Razón Social */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Razón Social <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={razonSocial}
                                onChange={e => setRazonSocial(e.target.value)}
                                placeholder="Nombre completo de la empresa"
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                    errores.razonSocial
                                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                            />
                            {errores.razonSocial && <p className="text-xs text-red-500 mt-1">{errores.razonSocial}</p>}
                        </div>
                    </div>

                    {/* ── Sección: Contacto Principal ── */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-4">Contacto Principal</h2>

                        {/* Correo Electrónico */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo Electrónico <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    placeholder="operaciones@empresa.com"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                        errores.correo
                                            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                    }`}
                                />
                            </div>
                            {errores.correo && <p className="text-xs text-red-500 mt-1">{errores.correo}</p>}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </span>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    placeholder="+519..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error API */}
                    {errorApi && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {errorApi}
                        </div>
                    )}

                    {/* ── Acciones ── */}
                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onVolver}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    REGISTRAR CLIENTE
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 bg-white border border-green-100 rounded-xl shadow-xl p-4 flex items-start gap-3 z-50 min-w-[300px]">
                    <div className="bg-green-100 p-1.5 rounded-full text-green-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Cliente registrado</p>
                        <p className="text-xs text-gray-500 mt-0.5">Credenciales enviadas a {resultado?.correo}</p>
                    </div>
                    <button onClick={() => setToast(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
