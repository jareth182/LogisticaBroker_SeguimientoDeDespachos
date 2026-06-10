import { useState } from 'react';

const API = 'http://localhost:5018/api/ItemsFactura';

export default function EditarDetalleMercancia({ despacho, itemsIniciales, onVolver, onIrBorrador }) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const [items, setItems]       = useState(
        itemsIniciales.map((it, i) => ({ ...it, _idx: i, _guardado: false, _error: null }))
    );
    const [busqueda, setBusqueda] = useState('');
    const [guardandoTodo, setGuardandoTodo] = useState(false);
    const [msgGlobal, setMsgGlobal] = useState(null);
    const [itemModal, setItemModal] = useState(null); // CA5: modal detalle

    const filtrados = items.filter(it =>
        it.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const setField = (idx, field, value) => {
        setItems(prev => prev.map(it =>
            it._idx === idx ? { ...it, [field]: value, _error: null } : it
        ));
    };

    const validarItem = (it) => {
        if (it.tieneRestriccion && !it.partidaArancelaria?.trim())
            return 'Completa la partida arancelaria antes de guardar';
        if (!it.partidaArancelaria?.trim())
            return 'La partida arancelaria debe contener exactamente 10 dígitos numéricos';
        if (!/^\d{10}$/.test(it.partidaArancelaria.trim()))
            return 'La partida arancelaria debe contener exactamente 10 dígitos numéricos';
        return null;
    };

    // Guarda todos los ítems extraídos en BD (sin partidas aún) y luego actualiza uno a uno con partidas
    const handleGuardarTodo = async () => {
        // Validar que todos tengan partida
        const errores = items.map(it => ({ ...it, _error: validarItem(it) }));
        if (errores.some(it => it._error)) { // PA HU11-2.1/2.2/3.1 NOK — al menos un ítem tiene error de validación
            setItems(errores);
            setMsgGlobal({ tipo: 'error', texto: 'Hay ítems con errores. Revise los campos marcados en rojo.' });
            return;
        }

        setGuardandoTodo(true);
        setMsgGlobal(null);

        try {
            // 1. Guardar ítems base en BD
            const resGuardar = await fetch(`${API}/${despacho.idDespacho}/guardar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items.map(it => ({
                    descripcion: it.descripcion,
                    cantidad:    it.cantidad,
                    valor:       it.valor,
                    peso:        it.peso
                })))
            });
            if (!resGuardar.ok) {
                const d = await resGuardar.json();
                setMsgGlobal({ tipo: 'error', texto: d.mensaje || 'Error al guardar los ítems.' });
                return;
            }

            // 2. Obtener los IDs recién creados
            const resLista = await fetch(`${API}/${despacho.idDespacho}`);
            const guardados = await resLista.json();

            // 3. Actualizar cada ítem con partida arancelaria
            for (let i = 0; i < guardados.length; i++) {
                const itemBD = guardados[i];
                const itemLocal = items[i];
                if (!itemLocal) continue;

                await fetch(`${API}/${itemBD.idItem}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partidaArancelaria:  itemLocal.partidaArancelaria.trim(),
                        tieneRestriccion:    itemLocal.tieneRestriccion ?? false,
                        usuarioModificacion: usuario.nombreCompleto || usuario.correo || 'Sistema'
                    })
                });
            }

            setMsgGlobal({ tipo: 'exito', texto: 'Cambios guardados correctamente.' });
            setItems(prev => prev.map(it => ({ ...it, _guardado: true })));

        } catch {
            setMsgGlobal({ tipo: 'error', texto: 'Error al guardar los cambios. Intenta nuevamente' });
        } finally {
            setGuardandoTodo(false);
        }
    };

    const handleEliminarItem = async (it) => {
        try {
            setItems(prev => prev.filter(x => x._idx !== it._idx));
        } catch {
            setMsgGlobal({ tipo: 'error', texto: 'Error al eliminar el ítem. Intenta nuevamente' });
        }
    };


    return (
        <>
            {itemModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={() => setItemModal(null)}
            >
                <div
                    className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">Detalle del Ítem</h3>
                        <button onClick={() => setItemModal(null)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <dl className="space-y-2 text-sm">
                        {[
                            ['Descripción', itemModal.descripcion],
                            ['Cantidad',    itemModal.cantidad],
                            ['Valor (USD)', itemModal.valor],
                            ['Peso (kg)',   itemModal.peso],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between gap-4">
                                <dt className="text-gray-400 shrink-0">{label}</dt>
                                <dd className="font-semibold text-gray-800 text-right">{val || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        )}

        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="font-mono text-gray-500">Despacho {despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Editar Detalle</span>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Editar Detalle Mercancía</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Clasificación arancelaria y restricciones por ítem extraído de la factura comercial.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onVolver}
                            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarTodo}
                            disabled={guardandoTodo}
                            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                                guardandoTodo
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#008b9c] text-white hover:bg-[#007685]'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            {guardandoTodo ? 'Guardando...' : 'Guardar Detalle'}
                        </button>
                    </div>
                </div>

                {/* Contador — actualiza al eliminar */}
                <div className="mt-3">
                    <span className="text-xs text-gray-500">
                        Mostrando {items.length} ítems extraídos
                    </span>
                </div>
            </div>

            {/* Mensaje global */}
            {msgGlobal && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${
                    msgGlobal.tipo === 'exito'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {msgGlobal.texto}
                </div>
            )}

            {/* Búsqueda */}
            <div className="relative mb-4">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                    type="text"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por descripción..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa] bg-white"
                />
            </div>

            {/* CA1.1 — sin ítems extraídos */}
            {items.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    No hay ítems extraídos para editar. Primero extrae los datos de la factura
                </div>
            )}

            {/* Tabla */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 w-8">#</th>
                            <th className="px-4 py-3">Descripción del Ítem</th>
                            <th className="px-4 py-3 w-52">Partida Arancelaria (10 dígitos)</th>
                            <th className="px-4 py-3 w-36 text-center">Restricciones</th>
                            <th className="px-4 py-3 w-20 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtrados.map((it) => {
                            const valido = it.partidaArancelaria && /^\d{10}$/.test(it.partidaArancelaria.trim());
                            return (
                                <tr key={it._idx} className={`hover:bg-gray-50 transition-colors ${it._error ? 'bg-red-50' : ''}`}>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{it._idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-800">{it.descripcion}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Cant: {it.cantidad} · Valor: ${Number(it.valor).toFixed(2)} · Peso: {it.peso} kg
                                        </p>
                                        {it.tieneRestriccion && (
                                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                                ⚠ Revisión requerida
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            value={it.partidaArancelaria || ''}
                                            onChange={e => setField(it._idx, 'partidaArancelaria', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="Ingresar partida..."
                                            maxLength={10}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm font-mono outline-none transition-all ${
                                                it._error
                                                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                                                    : valido
                                                        ? 'border-green-300 bg-green-50'
                                                        : 'border-gray-300 focus:border-[#008b9c] focus:ring-2 focus:ring-[#e0f7fa]'
                                            }`}
                                        />
                                        {it._error && (
                                            <p className="text-xs text-red-500 mt-1">{it._error}</p>
                                        )}
                                        {valido && !it._error && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Máquinas automáticas para tratamiento o procesamiento de datos
                                            </p>
                                        )}
                                        {!valido && !it._error && (
                                            <p className="text-xs text-red-400 mt-1">Falta clasificación arancelaria</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={it.tieneRestriccion || false}
                                                onChange={e => setField(it._idx, 'tieneRestriccion', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#008b9c] focus:ring-[#008b9c]"
                                            />
                                            <span className="text-xs font-semibold text-gray-600">DIGESA/DIGEMID</span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* CA5 — ver detalle */}
                                            <button
                                                onClick={() => setItemModal(it)}
                                                title="Ver detalle"
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            {/* CA4 — eliminar ítem */}
                                            <button
                                                onClick={() => handleEliminarItem(it)}
                                                title="Eliminar ítem"
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Botón para ir al borrador DAM — disponible siempre tras guardar */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={onIrBorrador}
                    className="px-4 py-2 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a30] transition-colors"
                >
                    Generar Borrador DAM →
                </button>
            </div>
        </div>
        </>
    );
}
