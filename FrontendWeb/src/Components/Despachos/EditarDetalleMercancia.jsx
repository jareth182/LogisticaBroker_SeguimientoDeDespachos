import { useState } from 'react';

const API = 'http://localhost:5018/api/ItemsFactura';

const UNIDADES = ['PZA', 'KG', 'LT', 'MT', 'M2', 'M3', 'PAR', 'SET', 'JGO', 'DOC', 'CAJA', 'RLL', 'BL', 'GR'];

function Field({ label, children, error }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
}

function NumInput({ value, onChange, placeholder = '0.00', step = '0.01' }) {
    return (
        <input
            type="number"
            min="0"
            step={step}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008b9c] focus:ring-1 focus:ring-[#e0f7fa]"
        />
    );
}

export default function EditarDetalleMercancia({ despacho, itemsIniciales, onVolver, onIrBorrador }) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const normalizar = (it, i) => ({
        _idx:              i,
        _error:            null,
        idItem:            it.idItem ?? null,
        descripcion:       String(it.descripcion ?? ''),
        cantidad:          String(it.cantidad ?? it.cantidad ?? ''),
        precioUnitario:    String(it.precioUnitario ?? it.valor ?? ''),
        unidadMedida:      String(it.unidadMedida ?? ''),
        paisOrigen:        String(it.paisOrigen ?? ''),
        numCajas:          String(it.numCajas ?? ''),
        volumen:           String(it.volumen ?? ''),
        pesoBruto:         String(it.pesoBruto ?? ''),
        pesoNeto:          String(it.pesoNeto ?? ''),
        partidaArancelaria: String(it.partidaArancelaria ?? ''),
    });

    const [items, setItems] = useState(itemsIniciales.map(normalizar));
    const [guardando, setGuardando] = useState(false);
    const [msgGlobal, setMsgGlobal] = useState(null);
    const [expandido, setExpandido] = useState(0);

    const setField = (idx, field, value) => {
        setItems(prev => prev.map(it =>
            it._idx === idx ? { ...it, [field]: value, _error: null } : it
        ));
    };

    const costoTotal = (it) => {
        const c = parseFloat(it.cantidad) || 0;
        const p = parseFloat(it.precioUnitario) || 0;
        return c * p;
    };

    const validar = (it) => {
        if (!it.partidaArancelaria?.trim())
            return 'La partida arancelaria debe contener exactamente 10 dígitos numéricos';
        if (!/^\d{10}$/.test(it.partidaArancelaria.trim()))
            return 'La partida arancelaria debe contener exactamente 10 dígitos numéricos';
        if (!it.cantidad || parseFloat(it.cantidad) <= 0)
            return 'La cantidad debe ser mayor a 0';
        if (!it.precioUnitario || parseFloat(it.precioUnitario) <= 0)
            return 'El precio unitario debe ser un valor positivo';
        return null;
    };

    const handleGuardarCambios = async () => {
        const validados = items.map(it => ({ ...it, _error: validar(it) }));
        if (validados.some(it => it._error)) {
            setItems(validados);
            setMsgGlobal({ tipo: 'error', texto: 'Hay ítems con errores. Revise los campos marcados.' });
            return;
        }
        setGuardando(true);
        setMsgGlobal(null);

        try {
            for (const it of items) {
                if (!it.idItem) continue;
                const res = await fetch(`${API}/${it.idItem}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partidaArancelaria:  it.partidaArancelaria.trim(),
                        descripcion:         it.descripcion,
                        cantidad:            parseFloat(it.cantidad) || 0,
                        valor:               parseFloat(it.precioUnitario) || 0,
                        unidadMedida:        it.unidadMedida || null,
                        paisOrigen:          it.paisOrigen || null,
                        numCajas:            it.numCajas !== '' ? parseFloat(it.numCajas) : null,
                        volumen:             it.volumen !== '' ? parseFloat(it.volumen) : null,
                        pesoBruto:           it.pesoBruto !== '' ? parseFloat(it.pesoBruto) : null,
                        pesoNeto:            it.pesoNeto !== '' ? parseFloat(it.pesoNeto) : null,
                        tieneRestriccion:    false,
                        usuarioModificacion: usuario.nombreCompleto || usuario.correo || 'Sistema'
                    })
                });
                if (!res.ok) {
                    const d = await res.json();
                    setMsgGlobal({ tipo: 'error', texto: d.mensaje || `Error al guardar ítem ${it._idx + 1}.` });
                    return;
                }
            }
            setMsgGlobal({ tipo: 'exito', texto: 'Cambios guardados correctamente.' });
            setTimeout(() => onVolver(), 800);
        } catch {
            setMsgGlobal({ tipo: 'error', texto: 'Error al guardar los cambios. Intenta nuevamente' });
        } finally {
            setGuardando(false);
        }
    };

    const fmt = (n) => isNaN(n) || n === 0 ? '—' : n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totalPesoBruto = items.reduce((s, it) => s + (parseFloat(it.pesoBruto) || 0), 0);
    const totalPesoNeto  = items.reduce((s, it) => s + (parseFloat(it.pesoNeto)  || 0), 0);
    const totalCosto     = items.reduce((s, it) => s + costoTotal(it), 0);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={onVolver} className="hover:text-[#008b9c] transition-colors">Operatividad</button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="font-mono text-gray-500">Despacho {despacho.codigoOrden}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#008b9c] font-semibold">Editar Detalle Mercancía</span>
            </div>

            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Editar Detalle Mercancía</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Complete todos los campos por ítem antes de generar el borrador DAM.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarCambios}
                            disabled={guardando}
                            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                                guardando ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1a2540] text-white hover:bg-[#0f1a30]'
                            }`}
                        >
                            {guardando ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{items.length} ítems extraídos</p>
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

            {items.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    No hay ítems extraídos para editar. Primero extrae los datos de la factura.
                </div>
            )}

            {/* Ítems acordeón */}
            <div className="space-y-3">
                {items.map((it) => {
                    const abierto = expandido === it._idx;
                    const valido  = it.partidaArancelaria && /^\d{10}$/.test(it.partidaArancelaria.trim());
                    return (
                        <div key={it._idx} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${it._error ? 'border-red-300' : 'border-gray-200'}`}>
                            {/* Cabecera del ítem */}
                            <button
                                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandido(abierto ? -1 : it._idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#e0f7fa] text-[#008b9c] text-xs font-bold shrink-0">{it._idx + 1}</span>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">{it.descripcion || 'Sin descripción'}</p>
                                        <p className="text-xs text-gray-400">
                                            {valido
                                                ? <span className="text-green-600 font-semibold">✓ {it.partidaArancelaria}</span>
                                                : <span className="text-amber-500">Partida pendiente</span>
                                            }
                                            {' · '}Costo: <span className="font-semibold">${fmt(costoTotal(it))}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {it._error && <span className="text-xs text-red-500 font-semibold">⚠ Error</span>}
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </button>

                            {/* Formulario expandible */}
                            {abierto && (
                                <div className="border-t border-gray-100 px-5 py-4">
                                    {it._error && (
                                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                                            {it._error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {/* Descripción Comercial */}
                                        <div className="col-span-2">
                                            <Field label="Descripción Comercial *">
                                                <input
                                                    type="text"
                                                    value={it.descripcion}
                                                    onChange={e => setField(it._idx, 'descripcion', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008b9c] focus:ring-1 focus:ring-[#e0f7fa]"
                                                />
                                            </Field>
                                        </div>

                                        {/* País de Origen */}
                                        <Field label="País de Origen">
                                            <input
                                                type="text"
                                                value={it.paisOrigen}
                                                onChange={e => setField(it._idx, 'paisOrigen', e.target.value)}
                                                placeholder="Ej: China"
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008b9c] focus:ring-1 focus:ring-[#e0f7fa]"
                                            />
                                        </Field>

                                        {/* Unidad de Medida */}
                                        <Field label="Unidad de Medida">
                                            <select
                                                value={it.unidadMedida}
                                                onChange={e => setField(it._idx, 'unidadMedida', e.target.value)}
                                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#008b9c] bg-white"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </Field>

                                        {/* Cantidad */}
                                        <Field label="Cantidad *" error={it._error?.includes('cantidad') ? it._error : null}>
                                            <NumInput
                                                value={it.cantidad}
                                                onChange={e => setField(it._idx, 'cantidad', e.target.value)}
                                                step="0.001"
                                            />
                                        </Field>

                                        {/* Precio Unitario */}
                                        <Field label="Precio Unitario (USD) *" error={it._error?.includes('precio') ? it._error : null}>
                                            <NumInput
                                                value={it.precioUnitario}
                                                onChange={e => setField(it._idx, 'precioUnitario', e.target.value)}
                                            />
                                        </Field>

                                        {/* Costo Total (calculado) */}
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Costo Total (USD)</label>
                                            <div className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-[#1a2540]">
                                                $ {fmt(costoTotal(it))}
                                            </div>
                                        </div>

                                        {/* N° Cajas */}
                                        <Field label="N° Cajas">
                                            <NumInput
                                                value={it.numCajas}
                                                onChange={e => setField(it._idx, 'numCajas', e.target.value)}
                                                placeholder="0"
                                                step="1"
                                            />
                                        </Field>

                                        {/* Volumen */}
                                        <Field label="Volumen (m³)">
                                            <NumInput
                                                value={it.volumen}
                                                onChange={e => setField(it._idx, 'volumen', e.target.value)}
                                                placeholder="0.000"
                                                step="0.001"
                                            />
                                        </Field>

                                        {/* Peso Bruto */}
                                        <Field label="Peso Bruto (KG)">
                                            <NumInput
                                                value={it.pesoBruto}
                                                onChange={e => setField(it._idx, 'pesoBruto', e.target.value)}
                                                placeholder="0.000"
                                                step="0.001"
                                            />
                                        </Field>

                                        {/* Peso Neto */}
                                        <Field label="Peso Neto (KG)">
                                            <NumInput
                                                value={it.pesoNeto}
                                                onChange={e => setField(it._idx, 'pesoNeto', e.target.value)}
                                                placeholder="0.000"
                                                step="0.001"
                                            />
                                        </Field>

                                        {/* Partida Arancelaria */}
                                        <div className="col-span-2">
                                            <Field label="Partida Arancelaria * (10 dígitos)" error={it._error?.includes('partida') || it._error?.includes('arancelaria') ? it._error : null}>
                                                <input
                                                    type="text"
                                                    value={it.partidaArancelaria}
                                                    onChange={e => setField(it._idx, 'partidaArancelaria', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    placeholder="Ej: 8471300000"
                                                    maxLength={10}
                                                    className={`w-full px-2 py-1.5 border rounded-lg text-xs font-mono outline-none transition-all ${
                                                        it._error ? 'border-red-300 bg-red-50' :
                                                        valido    ? 'border-green-300 bg-green-50' :
                                                                    'border-gray-300 focus:border-[#008b9c] focus:ring-1 focus:ring-[#e0f7fa]'
                                                    }`}
                                                />
                                                {!valido && !it._error && (
                                                    <p className="text-xs text-amber-500 mt-0.5">Ingresa los 10 dígitos</p>
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Totalizadores */}
            {items.length > 0 && (
                <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Totales del expediente</p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Peso Bruto Total', value: `${fmt(totalPesoBruto)} KG` },
                            { label: 'Peso Neto Total',  value: `${fmt(totalPesoNeto)} KG`  },
                            { label: 'Costo Total (USD)', value: `$ ${fmt(totalCosto)}`      },
                        ].map(t => (
                            <div key={t.label} className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-400">{t.label}</p>
                                <p className="text-sm font-bold text-[#1a2540] mt-0.5">{t.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
