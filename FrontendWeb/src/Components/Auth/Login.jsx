import { useState } from 'react';
import heroImage from '../../assets/hero.png';

export default function Login({ onLoginExitoso }) {
    const [correo, setCorreo]         = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mostrarPass, setMostrarPass] = useState(false);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');

    const API_BASE_URL = 'http://localhost:5018/api/Auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y datos del usuario en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                // Notificar al App.jsx que el login fue exitoso
                onLoginExitoso(data.usuario);
            } else {
                setError(data.mensaje || 'Correo o contraseña incorrectos');
            }
        } catch {
            setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Panel izquierdo (decorativo) ── */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-[#0b1727] flex-col items-center justify-center p-16 relative overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(6, 16, 30, 0.85), rgba(6, 16, 30, 0.92)), url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Patrón de fondo */}
                <div
                    className="absolute inset-0 opacity-15"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '34px 34px' }}
                />
                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#00b4d8] rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-white text-2xl font-bold">Logística Broker</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                        Gestión Aduanera<br />
                        <span className="text-[#00b4d8]">Inteligente</span>
                    </h1>
                    <p className="text-gray-300 text-lg max-w-md mx-auto">
                        Optimiza tus operaciones de comercio exterior con nuestra plataforma integral para gestión de despachos marítimos y documentación aduanera.
                    </p>
                    <div className="mt-12 space-y-4 text-left">
                        {['Tracking en tiempo real', 'Gestión documental automatizada', 'Reportes y análisis avanzados'].map(item => (
                            <div key={item} className="flex items-center gap-4 text-gray-200">
                                <div className="w-6 h-6 rounded-full bg-[#00b4d8] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-base">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="absolute bottom-8 text-sm text-gray-400">© 2026 Logística Broker. Todos los derechos reservados.</p>
            </div>

            {/* ── Panel derecho (formulario) ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-10">
                <div className="w-full max-w-xl">
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Iniciar Sesión</h2>
                    <p className="text-gray-500 text-base mb-10">Ingresa tus credenciales para acceder al sistema</p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-base text-red-700 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Correo */}
                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={correo}
                                    onChange={e => setCorreo(e.target.value)}
                                    placeholder="usuario@empresa.com"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none text-base transition-all"
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={mostrarPass ? 'text' : 'password'}
                                    required
                                    value={contrasena}
                                    onChange={e => setContrasena(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none text-base transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {mostrarPass ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Recordarme */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-base text-gray-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#00b4d8]" />
                                Recordarme
                            </label>
                            <button 
                                type="button" 
                                onClick={() => alert('Funcionalidad disponible próximamente. Contacta al administrador del sistema.')}
                                className="text-base text-[#00b4d8] hover:underline font-medium">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Botón submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 bg-[#00b4d8] text-white font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
                        </button>

                    </form>

                    <p className="mt-7 text-center text-sm text-gray-400">
                        ¿Necesitas ayuda?{' '}
                        <span className="text-[#00b4d8] font-medium cursor-pointer hover:underline">Contacta soporte</span>
                    </p>
                    <p className="mt-2 text-center text-sm text-gray-400">Acceso protegido y encriptado</p>
                </div>
            </div>

        </div>
    );
}
