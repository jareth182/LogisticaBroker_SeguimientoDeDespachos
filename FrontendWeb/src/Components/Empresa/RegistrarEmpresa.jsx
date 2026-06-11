import { useState } from 'react';

const API_BASE = 'http://localhost:5018/api/Empresa';

export default function RegistrarEmpresa({ onVolver, empresaEditar = null }) {
    const esEdicion = !!empresaEditar;

    const [ruc, setRuc]                         = useState(empresaEditar?.ruc            || '');
    const [razonSocial, setRazonSocial]         = useState(empresaEditar?.razonSocial    || '');
    const [personaContacto, setPersonaContacto] = useState(empresaEditar?.nombreContacto || '');
    const [correo, setCorreo]                   = useState(empresaEditar?.correo         || '');
    const [telefono, setTelefono]               = useState(empresaEditar?.celular        || '');
    const [direccionFiscal, setDireccionFiscal] = useState(empresaEditar?.direccion      || '');

    const [errores, setErrores]     = useState({});
    const [loading, setLoading]     = useState(false);
    const [errorApi, setErrorApi]   = useState('');
    const [resultado, setResultado] = useState(null);

    const validar = () => {
        const e = {};
        if (!esEdicion) {
            if (!ruc.trim())                       e.ruc = 'El RUC es obligatorio';
            else if (!/^\d{11}$/.test(ruc.trim())) e.ruc = 'El RUC debe tener 11 dígitos';
        }
        if (!razonSocial.trim())     e.razonSocial     = 'La razón social es obligatoria';
        if (!personaContacto.trim()) e.personaContacto = 'La persona de contacto es obligatoria';
        if (!correo.trim())          e.correo          = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.correo = 'Formato de correo inválido';
        if (!telefono.trim())        e.telefono        = 'El teléfono de contacto es obligatorio';
        if (!direccionFiscal.trim()) e.direccionFiscal = 'La dirección fiscal es obligatoria';
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);
        setErrorApi('');

        try {
            let res, data;

            if (esEdicion) {
                res = await fetch(`${API_BASE}/${empresaEditar.idEmpresa}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razonSocial:    razonSocial.trim(),
                        nombreContacto: personaContacto.trim(),
                        correo:         correo.trim(),
                        celular:        telefono.trim(),
                        direccion:      direccionFiscal.trim(),
                        estado:         empresaEditar.estado,
                    }),
                });
                data = await res.json();
                if (res.ok) {
                    setResultado({
                        modoEdicion:     true,
                        ruc:             empresaEditar.ruc,
                        razonSocial:     razonSocial.trim(),
                        personaContacto: personaContacto.trim(),
                        correo:          correo.trim(),
                        telefono:        telefono.trim(),
                        direccionFiscal: direccionFiscal.trim(),
                    });
                } else {
                    setErrorApi(data.error || data.mensaje || 'Error al actualizar el cliente.');
                }
            } else {
                res = await fetch(`${API_BASE}/registrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ruc:             ruc.trim(),
                        razonSocial:     razonSocial.trim(),
                        nombreContacto:  personaContacto.trim(),
                        correo:          correo.trim(),
                        celular:         telefono.trim(),
                        direccionFiscal: direccionFiscal.trim(),
                    }),
                });
                data = await res.json();
                if (res.ok) {
                    setResultado({
                        modoEdicion:     false,
                        ...data,
                        personaContacto: personaContacto.trim(),
                        telefono:        telefono.trim(),
                        direccionFiscal: direccionFiscal.trim(),
                    });
                } else {
                    setErrorApi(data.error || data.mensaje || 'Error al registrar el cliente.');
                }
            }
        } catch {
            setErrorApi('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (resultado) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {resultado.modoEdicion ? 'Cambios guardados exitosamente' : 'Cliente registrado exitosamente'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {resultado.modoEdicion
                            ? <>La información de <span className="font-semibold text-gray-700">{resultado.razonSocial}</span> ha sido actualizada.</>
                            : <>Se han enviado las credenciales de acceso a <span className="font-semibold text-gray-700">{resultado.correo}</span></>
                        }
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">RUC</span><span className="font-semibold font-mono">{resultado.ruc}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Razón Social</span><span className="font-semibold">{resultado.razonSocial}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Persona de contacto</span><span className="font-semibold">{resultado.personaContacto}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Correo</span><span className="font-semibold">{resultado.correo}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Teléfono de contacto</span><span className="font-semibold">{resultado.telefono}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Dirección Fiscal</span><span className="font-semibold">{resultado.direccionFiscal}</span></div>
                        {!resultado.modoEdicion && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Estado</span>
                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Pendiente de formalización</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onVolver}
                        className="w-full py-2.5 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#243050] transition-colors"
                    >
                        VER CLIENTES
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">

            <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {esEdicion
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        }
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {esEdicion ? 'Editar Cliente' : 'Registrar Cuenta Cliente'}
                </h1>
            </div>
            <p className="text-sm text-gray-500 mb-6 ml-11">
                {esEdicion
                    ? 'Modifica los datos fiscales y de contacto del cliente.'
                    : 'Ingresa los datos fiscales y de contacto para dar de alta a un nuevo cliente en el sistema.'
                }
            </p>

            <form onSubmit={handleSubmit}>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

                    {/* ── Datos Fiscales ── */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-4">Datos Fiscales</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                RUC {!esEdicion && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={ruc}
                                onChange={e => !esEdicion && setRuc(e.target.value.replace(/\D/g,'').slice(0,11))}
                                placeholder="1845... o 205..."
                                maxLength={11}
                                disabled={esEdicion}
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                    esEdicion
                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                        : errores.ruc
                                            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                            />
                            {errores.ruc && <p className="text-xs text-red-500 mt-1">{errores.ruc}</p>}
                        </div>

                        <div className="mb-4">
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Dirección Fiscal <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={direccionFiscal}
                                onChange={e => setDireccionFiscal(e.target.value)}
                                placeholder="Av. Principal 123, Lima"
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                    errores.direccionFiscal
                                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                            />
                            {errores.direccionFiscal && <p className="text-xs text-red-500 mt-1">{errores.direccionFiscal}</p>}
                        </div>
                    </div>

                    {/* ── Contacto Principal ── */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-4">Contacto Principal</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Persona de contacto <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={personaContacto}
                                onChange={e => setPersonaContacto(e.target.value)}
                                placeholder="Nombre del representante"
                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                    errores.personaContacto
                                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                        : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                }`}
                            />
                            {errores.personaContacto && <p className="text-xs text-red-500 mt-1">{errores.personaContacto}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo electrónico <span className="text-red-500">*</span>
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Teléfono de contacto <span className="text-red-500">*</span>
                            </label>
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
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                                        errores.telefono
                                            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400'
                                    }`}
                                />
                            </div>
                            {errores.telefono && <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>}
                        </div>
                    </div>

                    {errorApi && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {errorApi}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onVolver}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
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
                                    {esEdicion ? 'Guardando...' : 'Registrando...'}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {esEdicion
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        }
                                    </svg>
                                    {esEdicion ? 'GUARDAR CAMBIOS' : 'CREAR CLIENTE'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
