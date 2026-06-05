import { useState } from 'react';

export default function RecuperarContrasena({ onVolver }) {
    const [correo, setCorreo]   = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [enviado, setEnviado] = useState(false);

    const API_BASE_URL = 'http://localhost:5018/api/Auth';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/recuperar-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const data = await response.json();

            if (response.ok) {
                setEnviado(true);
            } else {
                setError(data.mensaje || 'Ocurrió un error. Intenta nuevamente.');
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

                {/* Ícono camión */}
                <div className="flex justify-center mb-5">
                    <div className="w-14 h-14 bg-[#1a2540] rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 8h-3V4H3C1.9 4 1 4.9 1 6v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5L21 12h-4V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                    </div>
                </div>

                {/* Título empresa */}
                <p className="text-center text-sm font-bold text-gray-900 mb-4">
                    Logística Broker Perú S.A.C.
                </p>

                {enviado ? (
                    /* ── Estado: correo enviado ── */
                    <div className="text-center">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Correo enviado</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Si el correo <span className="font-semibold text-gray-700">{correo}</span> está registrado, recibirás las instrucciones para restablecer tu acceso.
                        </p>
                        <button
                            onClick={onVolver}
                            className="w-full py-3 bg-[#1a2540] text-white font-semibold rounded-lg text-sm hover:bg-[#243050] transition-colors"
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                ) : (
                    /* ── Formulario ── */
                    <>
                        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                            Recuperar Contraseña
                        </h2>
                        <p className="text-center text-sm text-gray-500 mb-6">
                            Ingresa tu correo corporativo. Te enviaremos las instrucciones para restablecer el acceso a tu cuenta.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Correo */}
                            <div>
                                <label className="block text-sm font-semibold text-[#4a7fa5] mb-1">
                                    Correo corporativo registrado
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
                                        placeholder="ejemplo@brokerperu.com"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                                    />
                                </div>
                            </div>

                            {/* Botón */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 bg-[#1a2540] text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#243050] transition-colors text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {loading ? 'Enviando...' : 'RECUPERAR CONTRASEÑA'}
                            </button>

                        </form>

                        {/* Divisor */}
                        <div className="my-5 border-t border-gray-200" />

                        {/* Volver al login */}
                        <div className="text-center">
                            <button
                                onClick={onVolver}
                                className="text-sm text-blue-500 hover:underline flex items-center justify-center gap-1 mx-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Regresar al Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
