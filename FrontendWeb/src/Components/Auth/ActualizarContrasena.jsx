import { useState, useEffect } from 'react';

export default function ActualizarContrasena({ onActualizado }) {
    const [nuevaContrasena, setNueva] = useState('');
    const [confirmar, setConfirmar]   = useState('');
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [exitoso, setExitoso]       = useState(false);

    useEffect(() => {
        if (exitoso) {
            const t = setTimeout(onActualizado, 2000);
            return () => clearTimeout(t);
        }
    }, [exitoso, onActualizado]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (nuevaContrasena !== confirmar) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        const seguridadOk = /[A-Z]/.test(nuevaContrasena) && /[0-9]/.test(nuevaContrasena) && /[^A-Za-z0-9]/.test(nuevaContrasena);
        if (!seguridadOk) {
            setError('La contraseña debe tener mínimo una mayúscula, un número y un carácter especial');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5018/api/Auth/actualizar-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ nuevaContrasena })
            });
            if (response.ok) {
                setExitoso(true);
            } else {
                const data = await response.json();
                setError(data.mensaje || 'Error al actualizar la contraseña.');
            }
        } catch {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (exitoso) {
        return (
            <div className="min-h-screen bg-[#edf1f7] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-md px-10 py-10 w-full max-w-sm text-center">
                    <p className="text-sm font-medium text-gray-700">
                        Contraseña actualizada exitosamente
                    </p>
                </div>
            </div>
        );
    }

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
                    Actualizar contraseña
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#4a7fa5] mb-1">
                            Nueva contraseña
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
                                value={nuevaContrasena}
                                onChange={e => setNueva(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#4a7fa5] mb-1">
                            Confirmar contraseña
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
                                value={confirmar}
                                onChange={e => setConfirmar(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm bg-white"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-[#1a2540] text-white font-semibold rounded-lg hover:bg-[#243050] transition-colors text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Actualizando...' : 'ACTUALIZAR'}
                    </button>
                </form>
            </div>
        </div>
    );
}
