import React, { useState, useEffect } from 'react';

export default function AsignarPartida({ idDespacho }) {
    // ── Estados del formulario ────────────────────────────────
    const [partidas, setPartidas]                     = useState([]);
    const [partidaNacional, setPartidaNacional]       = useState('');
    const [subpartidaNaban, setSubpartidaNaban]       = useState('');
    const [cantidadBultos, setCantidadBultos]         = useState(0);
    const [pesoNetoKg, setPesoNetoKg]                 = useState(0);
    const [pesoBrutoKg, setPesoBrutoKg]               = useState(0);
    const [descripcionMercancias, setDescripcionMercancias] = useState('');

    // ── Estados de UI ─────────────────────────────────────────
    const [loading, setLoading]         = useState(false);
    const [loadingLista, setLoadingLista] = useState(false);
    const [mensaje, setMensaje]         = useState(null);
    const [errorPartida, setErrorPartida] = useState('');

    const API_BASE_URL = `http://localhost:5018/api/Despachos/${idDespacho}/partidas`;

    // ── Cargar partidas existentes al montar ──────────────────
    useEffect(() => {
        cargarPartidas();
    }, [idDespacho]);

    const cargarPartidas = async () => {
        setLoadingLista(true);
        try {
            const response = await fetch(API_BASE_URL);
            if (response.ok) {
                const data = await response.json();
                setPartidas(data);
            }
        } catch (error) {
            console.error('Error al cargar partidas:', error);
        } finally {
            setLoadingLista(false);
        }
    };

    // ── Validación en tiempo real de partida nacional ─────────
    const handlePartidaChange = (e) => {
        const valor = e.target.value.replace(/\D/g, ''); // solo dígitos
        setPartidaNacional(valor);
        if (valor.length > 0 && valor.length !== 10) {
            setErrorPartida('La partida nacional debe tener exactamente 10 dígitos numéricos');
        } else {
            setErrorPartida('');
        }
    };

    // ── Limpiar formulario ────────────────────────────────────
    const limpiarFormulario = () => {
        setPartidaNacional('');
        setSubpartidaNaban('');
        setCantidadBultos(0);
        setPesoNetoKg(0);
        setPesoBrutoKg(0);
        setDescripcionMercancias('');
        setErrorPartida('');
        setMensaje(null);
    };

    // ── Enviar formulario — POST HU09 ─────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (partidaNacional.length !== 10) {
            setErrorPartida('La partida nacional debe tener exactamente 10 dígitos numéricos');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partidaNacional,
                    subpartidaNaban,
                    cantidadBultos:        Number(cantidadBultos),
                    pesoNetoKg:            Number(pesoNetoKg),
                    pesoBrutoKg:           Number(pesoBrutoKg),
                    descripcionMercancias
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'exito', texto: 'Partida arancelaria asignada correctamente. Etapa marcada como Clasificado.' });
                limpiarFormulario();
                await cargarPartidas(); // refrescar lista
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al asignar la partida.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Eliminar partida ──────────────────────────────────────
    const handleEliminar = async (idPartida) => {
        if (!window.confirm('¿Estás seguro de eliminar esta partida?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${idPartida}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'exito', texto: data.mensaje });
                await cargarPartidas();
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al eliminar la partida.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor.' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 space-y-6">

            {/* ── Formulario ── */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Asignar Partida Arancelaria</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Ingresa el código de partida arancelaria nacional de 10 dígitos correspondiente a la mercancía.
                </p>

                {/* Mensaje de éxito o error */}
                {mensaje && (
                    <div className={`p-4 mb-6 rounded-md text-sm font-medium ${
                        mensaje.tipo === 'exito'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Partida Nacional — campo principal HU09 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Partida Nacional <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={10}
                                value={partidaNacional}
                                onChange={handlePartidaChange}
                                placeholder="Ej. 9503009500"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm font-mono tracking-widest ${
                                    errorPartida ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {errorPartida && (
                                <p className="mt-1 text-xs text-red-600">{errorPartida}</p>
                            )}
                            {partidaNacional.length > 0 && !errorPartida && (
                                <p className="mt-1 text-xs text-green-600">✓ Formato correcto</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">{partidaNacional.length}/10 dígitos</p>
                        </div>

                        {/* Subpartida NABAN */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Subpartida NALAD/NABAN
                            </label>
                            <input
                                type="text"
                                value={subpartidaNaban}
                                onChange={(e) => setSubpartidaNaban(e.target.value)}
                                placeholder="Ej. 9503.00.95.00"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Cantidad de Bultos */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Cantidad de Bultos
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={cantidadBultos}
                                onChange={(e) => setCantidadBultos(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Peso Neto */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Peso Neto (kg)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.001"
                                value={pesoNetoKg}
                                onChange={(e) => setPesoNetoKg(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Peso Bruto */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Peso Bruto (kg)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.001"
                                value={pesoBrutoKg}
                                onChange={(e) => setPesoBrutoKg(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Descripción de Mercancías */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Descripción de Mercancías
                        </label>
                        <textarea
                            rows={3}
                            value={descripcionMercancias}
                            onChange={(e) => setDescripcionMercancias(e.target.value)}
                            placeholder="Ej. 1. JUGUETE VEHÍCULO MODELO TRACTO..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-6 mt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={limpiarFormulario}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Limpiar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !!errorPartida}
                            className={`px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 ${
                                loading || errorPartida ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Guardando...' : 'Asignar Partida'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Lista de partidas asignadas ── */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Partidas Asignadas
                    {partidas.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full">
                            {partidas.length}
                        </span>
                    )}
                </h3>

                {loadingLista ? (
                    <p className="text-sm text-gray-400 text-center py-6">Cargando partidas...</p>
                ) : partidas.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                        No hay partidas asignadas aún para este despacho.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="pb-3 pr-4 font-semibold">Partida Nacional</th>
                                    <th className="pb-3 pr-4 font-semibold">Subpartida</th>
                                    <th className="pb-3 pr-4 font-semibold">Bultos</th>
                                    <th className="pb-3 pr-4 font-semibold">Peso Neto (kg)</th>
                                    <th className="pb-3 pr-4 font-semibold">Peso Bruto (kg)</th>
                                    <th className="pb-3 font-semibold">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {partidas.map((p) => (
                                    <tr key={p.idPartida} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pr-4 font-mono font-semibold text-gray-800">
                                            {p.partidaNacional}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {p.subpartidaNaban || '—'}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {p.cantidadBultos}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {p.pesoNetoKg}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {p.pesoBrutoKg}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => handleEliminar(p.idPartida)}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}