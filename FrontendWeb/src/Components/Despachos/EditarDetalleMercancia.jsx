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

    const filtrados = items.filter(it =>
        it.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const setField = (idx, field, value) => {
        setItems(prev => prev.map(it =>
            it._idx === idx ? { ...it, [field]: value, _error: null } : it
        ));
    };

    const validarItem = (it) => {
        if (!it.partidaArancelaria?.trim()) // PA HU11-2.1 NOK — campo vacío; cubre también PA HU11-3.1 NOK (restricción sin partida)
            return 'El campo de partida arancelaria es obligatorio.';
        if (it.tieneRestriccion && !it.partidaArancelaria?.trim()) // PA HU11-3.1 NOK — restricción marcada sin partida (dead branch: ya capturado arriba)
            return 'Debe completar la partida arancelaria antes de registrar restricciones técnicas.';
        if (!/^\d{10}$/.test(it.partidaArancelaria.trim())) // PA HU11-2.2 NOK — formato inválido (letras, guiones, longitud ≠ 10)
            return 'La partida arancelaria debe contener únicamente caracteres numéricos con el formato oficial del arancel de aduanas.';
        return null; // PA HU11-2 OK / HU11-3 OK — partida válida (10 dígitos numéricos)
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

            setMsgGlobal({ tipo: 'exito', texto: '¡Todos los detalles guardados correctamente! Puede proceder a generar el borrador DAM.' }); // PA HU11-2 OK / HU11-3 OK — partidas y/o restricciones guardadas
            setItems(prev => prev.map(it => ({ ...it, _guardado: true })));

        } catch { // PA HU11-2.3 NOK / HU11-3.2 NOK — error de red al guardar
            setMsgGlobal({ tipo: 'error', texto: 'No se pudo guardar el detalle. Verifique su conexión e intente nuevamente.' });
        } finally {
            setGuardandoTodo(false);
        }
    };

    const todosGuardados = items.every(it => it._guardado);
    const totalItems = items.length;
    const clasificados = items.filter(it => it.partidaArancelaria?.length === 10 && /^\d{10}$/.test(it.partidaArancelaria)).length;

    return (
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

                {/* Progreso */}
                <div className="mt-3 flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                        Mostrando {totalItems} ítems extraídos
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#008b9c] rounded-full transition-all"
                                style={{ width: `${totalItems > 0 ? (clasificados / totalItems) * 100 : 0}%` }}
                            />
                        </div>
                        <span className={`text-xs font-semibold ${clasificados === totalItems && totalItems > 0 ? 'text-[#008b9c]' : 'text-gray-400'}`}>
                            {clasificados}/{totalItems} clasificados
                        </span>
                    </div>
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

            {/* Tabla */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 w-8">#</th>
                            <th className="px-4 py-3">Descripción del Ítem</th>
                            <th className="px-4 py-3 w-52">Partida Arancelaria (10 dígitos)</th>
                            <th className="px-4 py-3 w-36 text-center">Restricciones</th>
                            <th className="px-4 py-3 w-20 text-center">Estado</th>
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
                                                ⚠ Restricción requerida
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
                                        {it._guardado ? (
                                            <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        ) : valido ? (
                                            <div className="w-2 h-2 rounded-full bg-[#008b9c] mx-auto" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-gray-300 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Ir a borrador */}
            {todosGuardados && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <p className="text-sm font-semibold text-green-800">
                            Todos los ítems han sido clasificados. Puede generar el borrador DAM.
                        </p>
                    </div>
                    <button
                        onClick={onIrBorrador}
                        className="px-4 py-2 bg-[#1a2540] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a30] transition-colors"
                    >
                        Generar Borrador DAM →
                    </button>
                </div>
            )}
        </div>
    );
}
