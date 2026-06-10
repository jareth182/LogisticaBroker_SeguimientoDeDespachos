import { useState } from 'react';

// Formato estándar SUNAT para numeración DAM: letras/dígitos
const REGEX_DAM = /^[A-Za-z0-9]{6,20}$/;

export default function RegistrarNumeracion({ despacho, onVolver, onRegistrado }) {
    const [numeracion, setNumeracion] = useState('');
    const [canal, setCanal] = useState('');
    const [intentoRegistrar, setIntentoRegistrar] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [registrado, setRegistrado] = useState(false);
    const [canalRegistrado, setCanalRegistrado] = useState('');

    // CA2: botón deshabilitado si campos vacíos
    const camposCompletos = numeracion.trim() !== '' && canal !== '';

    const handleRegistrar = () => {
        setIntentoRegistrar(true);
        if (!camposCompletos || procesando) return;
        setProcesando(true);
        // CA1: simula guardado y notificación al cliente
        setTimeout(() => {
            setProcesando(false);
            setCanalRegistrado(canal);
            setRegistrado(true);
            onRegistrado?.({ numeracion, canal });
        }, 1000);
    };

    if (registrado) {
        const esVerde = canalRegistrado === 'Verde';
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-bold text-green-800">Numeración registrada</p>
                        <p className="text-sm text-green-600 mt-0.5">
                            El cliente fue notificado. Canal: <span className="font-bold">{canalRegistrado}</span>.
                        </p>
                        {/* CA3: indicar paso habilitado según canal */}
                        <p className="text-sm text-green-700 mt-1 font-semibold">
                            {esVerde
                                ? 'Se habilitó el paso: Levante Autorizado.'
                                : 'Se habilitó el paso: Diligencias/Aforo.'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onVolver}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={onVolver}
                className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-[#008b9c] transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                ← Volver
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrar Numeración Aduanera</h1>
            <p className="text-sm text-gray-500 mb-6">
                Despacho: <span className="font-semibold">{despacho?.codigoBl ?? 'BL-2024-001'}</span>
            </p>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">

                {/* Campo numeración DAM — CA2 indicador requerido */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Numeración oficial de la DAM <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={numeracion}
                        onChange={e => setNumeracion(e.target.value)}
                        placeholder="Ej. 118-2024-10-000123"
                        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                            intentoRegistrar && !numeracion.trim() ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {/* CA2: indicador visual campo requerido */}
                    {intentoRegistrar && !numeracion.trim() && (
                        <p className="text-xs text-red-600 mt-1">La numeración de la DAM es requerida.</p>
                    )}
                </div>

                {/* Selector de canal — CA2 indicador requerido */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Canal <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={canal}
                        onChange={e => setCanal(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008b9c] ${
                            intentoRegistrar && !canal ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Seleccionar canal...</option>
                        <option value="Verde">Verde</option>
                        <option value="Naranja">Naranja</option>
                        <option value="Rojo">Rojo</option>
                    </select>
                    {/* CA2: indicador visual campo requerido */}
                    {intentoRegistrar && !canal && (
                        <p className="text-xs text-red-600 mt-1">El canal es requerido.</p>
                    )}
                </div>

                {/* CA1: botón REGISTRAR NUMERACIÓN */}
                <div className="flex justify-end">
                    <button
                        onClick={handleRegistrar}
                        disabled={procesando}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            !camposCompletos || procesando
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                : 'bg-[#1a2540] hover:bg-[#243050] text-white'
                        }`}
                    >
                        {procesando ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Registrando...
                            </>
                        ) : (
                            'REGISTRAR NUMERACIÓN'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
