import { useState } from 'react';

export default function Login({ onLoginExitoso, onIrRecuperar, mensajeInicial = '' }) {
    const [correo, setCorreo]         = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(mensajeInicial);

    const API_BASE_URL = 'http://localhost:5018/api/Auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!correo.trim() || !contrasena.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
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
        <div className="min-h-screen bg-[#edf1f7] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-md px-10 py-10 w-full max-w-sm">

                <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 8h-3V4H3C1.9 4 1 4.9 1 6v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5L21 12h-4V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                    </div>
                </div>

                <h1 className="text-center text-lg font-bold text-gray-900 mb-0.5">
                    Logística Broker Perú S.A.C.
                </h1>
                <p className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-6">
                    Iniciar Sesion
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-semibold text-[#4a7fa5] mb-1">
                            Email
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
                                placeholder="coordinador@brokerperu.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#4a7fa5] mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                type="password"
                                required
                                value={contrasena}
                                onChange={e => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onIrRecuperar}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-[#1a2540] text-white font-semibold rounded-lg hover:bg-[#243050] transition-colors text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Autenticando...' : 'INICIAR SESIÓN'}
                    </button>

                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Sistema de Gestión Institucional v2.4
                </p>
            </div>
        </div>
    );
}
