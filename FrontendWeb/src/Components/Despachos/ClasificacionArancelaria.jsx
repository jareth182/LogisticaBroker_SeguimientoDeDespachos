import { useState, useEffect } from 'react';

const API = 'http://localhost:5018/api/Despachos';

// ── Step Indicator ────────────────────────────────────────────
function StepIndicator({ paso }) {
    const pasos = [
        { id: 1, label: 'Clasificar mercancía', sub: 'Ingresa la subpartida de 10 dígitos' },
        { id: 2, label: 'Confirmación',          sub: 'Se registra la clasificación'        },
    ];
    return (
        <div className="flex items-center gap-0 mb-6">
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
                                {completo
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    : p.id}
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

export default function ClasificacionArancelaria({ despacho, onVolver, onVerLiquidaciones }) {
    const [paso, setPaso] = useState(1);

    // ── Formulario ────────────────────────────────────────────
    const [partidaNacional, setPartidaNacional]           = useState('');
    const [subpartidaNaban, setSubpartidaNaban]           = useState('');
    const [cantidadBultos, setCantidadBultos]             = useState('');
    const [pesoNetoKg, setPesoNetoKg]                     = useState('');
    const [pesoBrutoKg, setPesoBrutoKg]                   = useState('');
    const [descripcionMercancias, setDescripcionMercancias] = useState('');
    const [notas, setNotas]                               = useState('');
    const [errorPartida, setErrorPartida]                 = useState('');

    // ── Lista de partidas existentes ──────────────────────────
    const [partidas, setPartidas]         = useState([]);
    const [loadingLista, setLoadingLista] = useState(true);

    // ── UI ────────────────────────────────────────────────────
    const [loading, setLoading]           = useState(false);
    const [errorApi, setErrorApi]         = useState(null);
    const [partidaGuardada, setPartidaGuardada] = useState(null);

    const API_PARTIDAS = `${API}/${despacho.idDespacho}/partidas`;

    useEffect(() => { cargarPartidas(); }, [despacho.idDespacho]);

    const cargarPartidas = async () => {
        setLoadingLista(true);
        try {
            const res = await fetch(API_PARTIDAS);
            if (res.ok) setPartidas(await res.json());
            else setPartidas([]);
        } catch (e) { console.error(e); setPartidas([]); }
        finally { setLoadingLista(false); }
    };

    const handlePartidaChange = (e) => {
        const valor = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPartidaNacional(valor);
        if (valor.length > 0 && valor.length !== 10) {
            setErrorPartida('La partida nacional debe tener exactamente 10 dígitos numéricos');
        } else {
            setErrorPartida('');
        }
    };

    const limpiar = () => {
        setPartidaNacional(''); setSubpartidaNaban(''); setCantidadBultos('');
        setPesoNetoKg(''); setPesoBrutoKg(''); setDescripcionMercancias('');
        setNotas(''); setErrorPartida(''); setErrorApi(null);
    };

    const handleGuardar = async () => {
        if (partidaNacional.length !== 10) {
            setErrorPartida('La partida nacional debe tener exactamente 10 dígitos numéricos');
            return;
        }
        setLoading(true);
        setErrorApi(null);
        try {
            const res = await fetch(API_PARTIDAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partidaNacional,
                    subpartidaNaban:       subpartidaNaban || null,
                    cantidadBultos:        Number(cantidadBultos) || 0,
                    pesoNetoKg:            Number(pesoNetoKg)     || 0,
                    pesoBrutoKg:           Number(pesoBrutoKg)    || 0,
                    descripcionMercancias: descripcionMercancias  || null,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setPartidaGuardada(data);
                setPaso(2);
                cargarPartidas();
            } else {
                setErrorApi(data.mensaje || 'Error al guardar la partida.');
            }
        } catch {
            setErrorApi('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (idPartida) => {
        if (!window.confirm('¿Eliminar esta partida?')) return;
        try {
            const res = await fetch(`${API_PARTIDAS}/${idPartida}`, { method: 'DELETE' });
            if (res.ok) cargarPartidas();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="max-w-5xl mx-auto">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Despachos</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-600 font-medium">{despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Clasificación</span>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#e0f7fa] rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#008b9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-lg font-bold text-gray-900">Clasificación Arancelaria</h1>
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                    {despacho.estado || 'En Apertura'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">
                                Despacho: <span className="font-semibold text-gray-700">{despacho.codigoOrden}</span>
                                {' · '}Cliente: <span className="font-semibold text-gray-700">{despacho.razonSocial}</span>
                                {' · '}BL: <span className="font-mono text-gray-600">{despacho.codigoBl}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onVolver}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Volver
                    </button>
                </div>
            </div>

            <div className="flex gap-5">

                {/* ── Columna principal ── */}
                <div className="flex-1 min-w-0">
                    <StepIndicator paso={paso} />

                    {/* ════ PASO 1: Formulario ════ */}
                    {paso === 1 && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">1</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Clasificar mercancía</p>
                                    <p className="text-xs text-gray-400">Ingresa la subpartida nacional de 10 dígitos.</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {errorApi && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {errorApi}
                                    </div>
                                )}

                                {/* Subpartida principal */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Subpartida nacional (10 dígitos) <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">Digita la subpartida de 10 dígitos según el arancel nacional.</p>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={partidaNacional}
                                            onChange={handlePartidaChange}
                                            placeholder="Ej. 8708293000"
                                            maxLength={10}
                                            className={`w-full px-4 py-3 border rounded-xl text-base font-mono tracking-widest outline-none transition-all ${
                                                errorPartida ? 'border-red-300 bg-red-50' :
                                                partidaNacional.length === 10 ? 'border-green-300 bg-green-50' :
                                                'border-gray-300 focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]'
                                            }`}
                                        />
                                        {partidaNacional.length === 10 && !errorPartida && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        {errorPartida
                                            ? <p className="text-xs text-red-500">{errorPartida}</p>
                                            : <p className="text-xs text-gray-400">Solo dígitos numéricos</p>
                                        }
                                        <p className={`text-xs font-semibold ${partidaNacional.length === 10 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {partidaNacional.length}/10
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Descripción arancelaria */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción arancelaria</label>
                                        <textarea rows={3} value={descripcionMercancias}
                                            onChange={e => setDescripcionMercancias(e.target.value)}
                                            placeholder="Los demás vehículos automóviles para transporte de mercancías con motor de émbolo (pistón)..."
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] resize-none" />
                                    </div>

                                    {/* Subpartida NABAN */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Subpartida NALAD/NABAN</label>
                                        <input type="text" value={subpartidaNaban}
                                            onChange={e => setSubpartidaNaban(e.target.value)}
                                            placeholder="Ej. 8708.29.30.00"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]" />
                                    </div>

                                    {/* Unidad de medida */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Unidad de medida</label>
                                        <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] bg-white">
                                            <option>u (Unidad)</option>
                                            <option>kg (Kilogramo)</option>
                                            <option>l (Litro)</option>
                                            <option>m (Metro)</option>
                                        </select>
                                    </div>

                                    {/* Cantidad bultos */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad de bultos</label>
                                        <input type="number" min="0" value={cantidadBultos}
                                            onChange={e => setCantidadBultos(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]" />
                                    </div>

                                    {/* Peso neto */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Peso Neto (kg)</label>
                                        <input type="number" min="0" step="0.001" value={pesoNetoKg}
                                            onChange={e => setPesoNetoKg(e.target.value)}
                                            placeholder="0.000"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]" />
                                    </div>

                                    {/* Peso bruto */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Peso Bruto (kg)</label>
                                        <input type="number" min="0" step="0.001" value={pesoBrutoKg}
                                            onChange={e => setPesoBrutoKg(e.target.value)}
                                            placeholder="0.000"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]" />
                                    </div>

                                    {/* Notas */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Notas (opcional)</label>
                                        <textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)}
                                            placeholder="Agrega una nota sobre la clasificación..."
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#008b9c] resize-none" />
                                        <p className="text-right text-[10px] text-gray-400 mt-0.5">{notas.length}/350</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={limpiar}
                                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        Limpiar
                                    </button>
                                    <button onClick={handleGuardar} disabled={loading || !!errorPartida || partidaNacional.length !== 10}
                                        className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm ${loading || errorPartida || partidaNacional.length !== 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {loading
                                            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Guardando...</>
                                            : <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                                Guardar
                                            </>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ PASO 2: Confirmación ════ */}
                    {paso === 2 && partidaGuardada && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#008b9c] text-white flex items-center justify-center text-sm font-bold ring-4 ring-[#e0f7fa]">2</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Confirmación</p>
                                    <p className="text-xs text-gray-400">Se registra la clasificación y se habilita el siguiente paso.</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Banner éxito */}
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-800">¡Clasificación registrada exitosamente!</p>
                                        <p className="text-xs text-green-600 mt-0.5">La subpartida ha sido asociada al expediente.</p>
                                    </div>
                                </div>

                                {/* Datos registrados */}
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-gray-400">Subpartida nacional</span>
                                        <span className="font-mono font-bold text-gray-800 text-base">{partidaGuardada.partidaNacional}</span>
                                    </div>
                                    {[
                                        { label: 'Subpartida NABAN',    value: partidaGuardada.subpartidaNaban       || '—' },
                                        { label: 'Descripción',         value: partidaGuardada.descripcionMercancias || '—' },
                                        { label: 'Cantidad de bultos',  value: partidaGuardada.cantidadBultos        ?? '—' },
                                        { label: 'Peso Neto (kg)',      value: partidaGuardada.pesoNetoKg            ?? '—' },
                                        { label: 'Peso Bruto (kg)',     value: partidaGuardada.pesoBrutoKg           ?? '—' },
                                        { label: 'Fecha de registro',   value: new Date().toLocaleDateString('es-PE') },
                                    ].map(f => (
                                        <div key={f.label} className="flex justify-between items-start gap-4">
                                            <span className="text-gray-400 shrink-0">{f.label}</span>
                                            <span className="font-semibold text-gray-700 text-right truncate max-w-[220px]">{f.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Aviso habilitación liquidación */}
                                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                    <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xs text-blue-700">
                                        La tarea ha sido marcada como <span className="font-bold">Clasificado</span> y el expediente ahora está disponible para el área de Liquidación.
                                    </p>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { limpiar(); setPaso(1); setPartidaGuardada(null); }}
                                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Agregar otra partida
                                    </button>
                                    <button onClick={() => onVerLiquidaciones(despacho)}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#008b9c] text-white text-sm font-semibold rounded-lg hover:bg-[#007685] transition-colors shadow-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Ir a Liquidación
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Lista de partidas asignadas ── */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-800">Despachos recientes — Partidas asignadas</p>
                                <p className="text-xs text-gray-400">Partidas arancelarias registradas para este despacho</p>
                            </div>
                            {partidas.length > 0 && (
                                <span className="px-2.5 py-1 bg-[#e0f7fa] text-[#008b9c] text-xs font-bold rounded-full">
                                    {partidas.length}
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            {loadingLista ? (
                                <div className="flex items-center justify-center h-16">
                                    <svg className="w-5 h-5 animate-spin text-[#008b9c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                </div>
                            ) : partidas.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No hay partidas asignadas aún para este despacho.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                                <th className="pb-3 pr-4">Partida Nacional</th>
                                                <th className="pb-3 pr-4">Subpartida</th>
                                                <th className="pb-3 pr-4">Bultos</th>
                                                <th className="pb-3 pr-4">Peso Neto</th>
                                                <th className="pb-3 pr-4">Peso Bruto</th>
                                                <th className="pb-3">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {partidas.map(p => (
                                                <tr key={p.idPartida} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 pr-4 font-mono font-bold text-gray-800">{p.partidaNacional}</td>
                                                    <td className="py-3 pr-4 text-gray-500">{p.subpartidaNaban || '—'}</td>
                                                    <td className="py-3 pr-4 text-gray-600">{p.cantidadBultos}</td>
                                                    <td className="py-3 pr-4 text-gray-600">{p.pesoNetoKg} kg</td>
                                                    <td className="py-3 pr-4 text-gray-600">{p.pesoBrutoKg} kg</td>
                                                    <td className="py-3">
                                                        <button onClick={() => handleEliminar(p.idPartida)}
                                                            className="text-red-400 hover:text-red-600 text-xs font-semibold transition-colors">
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
                </div>

                {/* ── Panel lateral ── */}
                <div className="w-60 shrink-0 space-y-4">

                    {/* Estado */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estado general actual</p>
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            {despacho.estado || 'En Apertura'}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">El expediente se encuentra en apertura operativa.</p>
                    </div>

                    {/* Flujo */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Flujo de trabajo</p>
                        <div className="space-y-3">
                            {[
                                { id: 1, label: 'Creación de despacho', done: true  },
                                { id: 2, label: 'Clasificación arancelaria', active: true  },
                                { id: 3, label: 'Liquidación de tributos', pending: true },
                                { id: 4, label: 'Generación de DAM',       pending: true },
                                { id: 5, label: 'Numeración oficial',       pending: true },
                            ].map((etapa, i) => (
                                <div key={etapa.id} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                            etapa.done   ? 'bg-[#008b9c] text-white' :
                                            etapa.active ? 'bg-[#008b9c] text-white ring-4 ring-[#e0f7fa]' :
                                                           'bg-gray-100 text-gray-400'
                                        }`}>
                                            {etapa.done
                                                ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                : etapa.id
                                            }
                                        </div>
                                        {i < 4 && <div className={`w-0.5 h-5 mt-1 ${etapa.done ? 'bg-[#008b9c]' : 'bg-gray-200'}`} />}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`text-xs font-semibold leading-tight ${etapa.active ? 'text-[#008b9c]' : etapa.done ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {etapa.label}
                                        </p>
                                        {etapa.active && <span className="text-[10px] text-[#008b9c] font-medium">En Proceso</span>}
                                        {etapa.done   && <span className="text-[10px] text-gray-400">Finalizado</span>}
                                        {etapa.pending && <span className="text-[10px] text-gray-300">Pendiente</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Siguiente responsable */}
                    <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Siguiente responsable</p>
                        <p className="text-xs font-semibold text-gray-700">Liquidador</p>
                        <p className="text-[10px] text-gray-400 mt-1">La tarea de liquidación ya está habilitada una vez clasificada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}