import { useState } from 'react';

const API = 'http://localhost:5018/api/Empresa/registrar';

// ── Indicador de pasos ────────────────────────────────────────
function StepIndicator({ paso }) {
    const pasos = [
        { id: 1, label: 'Datos de la empresa',   sub: 'Completa la información' },
        { id: 2, label: 'Confirmación',           sub: 'Revisa y confirma'       },
        { id: 3, label: 'Cuenta generada',        sub: 'Usuario y contraseña temporal' },
    ];

    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {pasos.map((p, i) => {
                const activo   = paso === p.id;
                const completo = paso > p.id;
                return (
                    <div key={p.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                completo ? 'bg-[#008b9c] text-white' :
                                activo   ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' :
                                           'bg-gray-100 text-gray-400 border-2 border-gray-200'
                            }`}>
                                {completo
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                      </svg>
                                    : p.id
                                }
                            </div>
                            <div className="mt-2 text-center w-28">
                                <p className={`text-xs font-bold leading-tight ${activo || completo ? 'text-[#008b9c]' : 'text-gray-400'}`}>
                                    {p.label}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{p.sub}</p>
                            </div>
                        </div>
                        {i < pasos.length - 1 && (
                            <div className={`w-24 h-0.5 mb-7 mx-1 transition-all duration-500 ${completo ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Campo de formulario ───────────────────────────────────────
function Campo({ label, value, onChange, placeholder, type = 'text', required = false, error, icon }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all
                        ${error
                            ? 'border-red-300 focus:ring-2 focus:ring-red-100 bg-red-50'
                            : 'border-gray-300 focus:ring-2 focus:ring-[#008b9c] focus:border-[#008b9c]'
                        }`}
                />
                {value && !error && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#008b9c]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function RegistrarEmpresa({ onVolver }) {
    const [paso, setPaso] = useState(1);

    // ── Campos del formulario ─────────────────────────────────
    const [ruc, setRuc]                         = useState('');
    const [razonSocial, setRazonSocial]         = useState('');
    const [nombreComercial, setNombreComercial] = useState('');
    const [telefono, setTelefono]               = useState('');
    const [contacto, setContacto]               = useState('');
    const [correo, setCorreo]                   = useState('');
    const [direccion, setDireccion]             = useState('');

    // ── Errores de validación ─────────────────────────────────
    const [errores, setErrores] = useState({});

    // ── Resultado del backend ─────────────────────────────────
    const [resultado, setResultado]   = useState(null);
    const [loading, setLoading]       = useState(false);
    const [errorApi, setErrorApi]     = useState(null);
    const [copiado, setCopiado]       = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    // ── Validaciones ──────────────────────────────────────────
    const validar = () => {
        const e = {};
        if (!ruc.trim())                          e.ruc = 'El RUC es obligatorio';
        else if (!/^\d{11}$/.test(ruc.trim()))    e.ruc = 'El RUC debe tener exactamente 11 dígitos';
        if (!razonSocial.trim())                  e.razonSocial = 'La razón social es obligatoria';
        if (!contacto.trim())                     e.contacto = 'El nombre de contacto es obligatorio';
        if (!correo.trim())                       e.correo = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.correo = 'El correo no tiene un formato válido';
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    // ── Ir a confirmación ─────────────────────────────────────
    const handleSiguiente = () => {
        if (!validar()) return;
        setPaso(2);
    };

    // ── Enviar al backend ─────────────────────────────────────
    const handleCrearCliente = async () => {
        setLoading(true);
        setErrorApi(null);
        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ruc:            ruc.trim(),
                    razonSocial:    razonSocial.trim(),
                    nombreContacto: contacto.trim(),
                    correo:         correo.trim(),
                    celular:        telefono.trim() || null,
                    direccion:      direccion.trim() || null,
                    estado:         'Activo'
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResultado(data);
                setPaso(3);
                setToastVisible(true);
                setTimeout(() => setToastVisible(false), 5000);
            } else {
                setErrorApi(data.error || 'Error al registrar la empresa.');
            }
        } catch {
            setErrorApi('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopiar = () => {
        if (resultado?.passwordTemporal) {
            navigator.clipboard.writeText(resultado.passwordTemporal);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        }
    };

    const handleNuevoCliente = () => {
        setRuc(''); setRazonSocial(''); setNombreComercial('');
        setTelefono(''); setContacto(''); setCorreo(''); setDireccion('');
        setErrores({}); setResultado(null); setErrorApi(null);
        setPaso(1);
    };

    return (
        <div className="max-w-5xl mx-auto">

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">
                    Clientes
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[#008b9c] font-semibold">Nuevo Cliente</span>
            </div>

            {/* ── Header ── */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Registra una nueva empresa importadora y genera automáticamente su acceso al sistema.
                </p>
            </div>

            {/* ── Step Indicator ── */}
            <StepIndicator paso={paso} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── COLUMNA IZQUIERDA ── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">

                    {/* PASO 1: Formulario */}
                    {paso === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-base font-bold text-gray-800">1. Datos de la empresa</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Ingresa la información del nuevo cliente.</p>
                            </div>

                            <Campo
                                label="RUC" required value={ruc}
                                onChange={e => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                placeholder="20123456789" error={errores.ruc}
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            />

                            <Campo
                                label="Razón Social" required value={razonSocial}
                                onChange={e => setRazonSocial(e.target.value)}
                                placeholder="IMPORTACIONES DEL PACÍFICO S.A.C." error={errores.razonSocial}
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Campo
                                    label="Nombre comercial (opcional)" value={nombreComercial}
                                    onChange={e => setNombreComercial(e.target.value)}
                                    placeholder="IMPAC S.A.C."
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                                />
                                <Campo
                                    label="Teléfono de contacto" required value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    placeholder="987 654 321"
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Campo
                                    label="Persona de contacto" required value={contacto}
                                    onChange={e => setContacto(e.target.value)}
                                    placeholder="Juan Pérez Gómez" error={errores.contacto}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                />
                                <Campo
                                    label="Correo electrónico" required value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    type="email" placeholder="jperez@impac.com.pe" error={errores.correo}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                />
                            </div>

                            <Campo
                                label="Dirección fiscal" value={direccion}
                                onChange={e => setDireccion(e.target.value)}
                                placeholder="Av. La Marina 1234, San Miguel, Lima - Perú"
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            />

                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Los campos marcados con * son obligatorios.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onVolver}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSiguiente}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Crear Cliente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Confirmación */}
                    {paso === 2 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-base font-bold text-gray-800">Confirmar registro</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Revisa los datos antes de crear el cliente.</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 text-sm">
                                <FilaConfirm label="RUC"              value={ruc} />
                                <FilaConfirm label="Razón Social"     value={razonSocial} />
                                {nombreComercial && <FilaConfirm label="Nombre Comercial" value={nombreComercial} />}
                                <FilaConfirm label="Contacto"         value={contacto} />
                                <FilaConfirm label="Correo"           value={correo} />
                                {telefono  && <FilaConfirm label="Teléfono"  value={telefono} />}
                                {direccion && <FilaConfirm label="Dirección" value={direccion} />}
                            </div>

                            {errorApi && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {errorApi}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setPaso(1); setErrorApi(null); }}
                                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    Volver
                                </button>
                                <button
                                    onClick={handleCrearCliente}
                                    disabled={loading}
                                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                            Creando cliente...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Crear Cliente
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Cuenta generada */}
                    {paso === 3 && resultado && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-base font-bold text-gray-800">3. Cuenta de acceso generada</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Se ha creado automáticamente el usuario y contraseña temporal para el acceso al sistema.
                                </p>
                            </div>

                            {/* Credenciales */}
                            <div className="bg-[#f0fdfa] border border-[#99f6e4] rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-[#008b9c] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Usuario generado</p>
                                        <p className="text-sm font-bold text-gray-800 font-mono">{resultado.usuarioGenerado}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-white border border-[#99f6e4] rounded-lg px-4 py-3">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Contraseña temporal</p>
                                        <p className="text-base font-bold font-mono tracking-widest text-gray-800">{resultado.passwordTemporal}</p>
                                    </div>
                                    <button
                                        onClick={handleCopiar}
                                        className={`p-2 rounded-lg transition-all ${copiado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        title="Copiar contraseña"
                                    >
                                        {copiado
                                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Aviso */}
                            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <p className="text-xs text-amber-700">
                                    La contraseña temporal ha sido encriptada y enviada al correo del contacto.
                                    El cliente debe cambiar su contraseña en el primer inicio de sesión.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleNuevoCliente}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 border border-[#008b9c] text-[#008b9c] text-sm font-semibold rounded-lg hover:bg-[#e0f7fa] transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Registrar otro cliente
                                </button>
                                <button
                                    onClick={onVolver}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm"
                                >
                                    Ver todos los clientes
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── COLUMNA DERECHA ── */}
                <div className="space-y-4">

                    {/* Paso 1: tip informativo */}
                    {paso === 1 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Requisitos del registro</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {[
                                    'RUC de 11 dígitos (validación de formato)',
                                    'Razón social completa de la empresa',
                                    'Correo válido (usuario@dominio.com)',
                                    'Nombre del contacto principal',
                                ].map((req, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-[#008b9c] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-700 font-medium">
                                    Al crear el cliente, el sistema generará automáticamente un usuario y contraseña temporal que se enviará al correo registrado.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Paso 2: resumen visual */}
                    {paso === 2 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">¿Qué pasará al confirmar?</p>
                            <div className="space-y-3">
                                {[
                                    { icon: '✅', text: 'La empresa quedará registrada en el sistema' },
                                    { icon: '🔐', text: 'Se generará un usuario y contraseña temporal encriptada' },
                                    { icon: '📧', text: `Se enviará un correo de bienvenida a ${correo}` },
                                    { icon: '🔒', text: 'La contraseña se almacena con hash BCrypt' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                        <span className="text-base">{item.icon}</span>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Paso 3: info de la empresa creada */}
                    {paso === 3 && resultado && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-green-700">¡Cliente registrado exitosamente!</p>
                                    <p className="text-xs text-gray-400">La empresa ha sido registrada en el sistema.</p>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Información de la empresa</p>
                            <div className="space-y-2 text-sm">
                                <FilaConfirm label="RUC"           value={resultado.ruc} />
                                <FilaConfirm label="Razón Social"  value={resultado.razonSocial} />
                                <FilaConfirm label="Contacto"      value={resultado.nombreContacto} />
                                <FilaConfirm label="Correo"        value={resultado.correo} />
                                <FilaConfirm label="Fecha registro" value={resultado.fechaRegistro} />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-gray-400">Estado</span>
                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Activo</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toast ── */}
            {toastVisible && (
                <div className="fixed bottom-6 right-6 bg-white border border-green-100 rounded-lg shadow-xl p-4 flex items-start gap-4 z-50 min-w-[320px]">
                    <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">Cliente creado correctamente</h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Se ha enviado un correo con las credenciales de acceso a {resultado?.correo}.
                        </p>
                    </div>
                    <button onClick={() => setToastVisible(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Fila de confirmación ──────────────────────────────────────
function FilaConfirm({ label, value }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-gray-400 shrink-0">{label}</span>
            <span className="text-gray-800 font-medium text-right">{value}</span>
        </div>
    );
}