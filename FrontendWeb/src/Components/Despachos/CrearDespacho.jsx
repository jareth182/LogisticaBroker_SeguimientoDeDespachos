import React, { useState, useEffect } from 'react';

export default function CrearDespacho({ onCreated }) {
    // 1. Estados Funcionales (Conectados a tu API)
    const [busqueda, setBusqueda] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [codigoBl, setCodigoBl] = useState('');
    
    // 2. Estados Visuales (Para completar el diseño del prototipo)
    const [tipoCarga, setTipoCarga] = useState('FCL');
    const [prioridad, setPrioridad] = useState('Normal');
    const [puertoOrigen, setPuertoOrigen] = useState('');
    const [puertoDestino, setPuertoDestino] = useState('');
    const [eta, setEta] = useState('');
    const [areaTecnica, setAreaTecnica] = useState('Operaciones Marítimas');
    const [observaciones, setObservaciones] = useState('');

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const API_BASE_URL = 'http://localhost:5018/api/Despachos';

    // Búsqueda en tiempo real de clientes (T30)
    useEffect(() => {
        const buscarClientes = async () => {
            if (busqueda.length < 3) {
                setClientes([]);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/clientes/buscar?termino=${busqueda}`);
                if (response.ok) {
                    const data = await response.json();
                    setClientes(data);
                }
            } catch (error) {
                console.error("Error API:", error);
            }
        };
        const timeoutId = setTimeout(() => buscarClientes(), 300);
        return () => clearTimeout(timeoutId);
    }, [busqueda]);

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setBusqueda(`${cliente.razonSocial} (${cliente.ruc})`);
        setClientes([]);
    };

    // Envío de la Historia de Usuario (T31)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);
        setLoading(true);

        if (!clienteSeleccionado) {
            setMensaje({ tipo: 'error', texto: 'Por favor, busca y selecciona un cliente de la lista.' });
            setLoading(false);
            return;
        }

        try {
            // Nota: Enviamos solo lo que tu backend soporta actualmente (idEmpresa y codigoBl).
            // Los demás campos del diseño están listos para cuando tu backend crezca.
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idEmpresa: clienteSeleccionado.idEmpresa,
                    codigoBl: codigoBl.toUpperCase()
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ tipo: 'exito', texto: `¡Despacho ${data.codigoOrden} creado exitosamente con el BL ${codigoBl.toUpperCase()}!` });
                // Notificar al componente padre (ej. para refrescar lista)
                if (onCreated) onCreated(data);
                // Limpiar formulario completo
                setCodigoBl('');
                setBusqueda('');
                setClienteSeleccionado(null);
                setPuertoOrigen('');
                setPuertoDestino('');
                setEta('');
                setObservaciones('');
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al registrar.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión. Verifica que el servidor .NET esté corriendo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 font-sans">
            <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Crear Nuevo Despacho</h1>

            {/* Alerta de Éxito o Error Flotante sobre el formulario */}
            {mensaje && (
                <div className={`p-4 mb-6 rounded-lg text-sm flex items-start gap-3 shadow-sm border ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {mensaje.tipo === 'exito' ? (
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                    <div>
                        <p className="font-bold">{mensaje.tipo === 'exito' ? 'Operación Exitosa' : 'Atención'}</p>
                        <p className="mt-0.5">{mensaje.texto}</p>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-white">
                    <h2 className="text-base font-bold text-gray-800">Formulario de Apertura - Datos del Expediente</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Fila 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Buscador de Cliente */}
                        <div className="relative md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cliente <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setClienteSeleccionado(null); }}
                                    placeholder="Buscar por RUC..." 
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] focus:ring-1 focus:ring-[#008b9c] outline-none transition-all" 
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            
                            {/* Dropdown de Resultados */}
                            {clientes.length > 0 && (
                                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {clientes.map((c) => (
                                        <li key={c.idEmpresa} onClick={() => seleccionarCliente(c)} className="px-4 py-2 hover:bg-cyan-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 text-gray-700">
                                            <span className="font-semibold block">{c.razonSocial}</span>
                                            <span className="text-xs text-gray-500">{c.ruc}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Código BL */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Número de Bill of Lading (BL) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                value={codigoBl}
                                onChange={(e) => setCodigoBl(e.target.value)}
                                placeholder="Ej. MSCU1234567" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] focus:ring-1 focus:ring-[#008b9c] outline-none uppercase transition-all" 
                            />
                        </div>

                        {/* Tipo de Carga */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo de Carga</label>
                            <select value={tipoCarga} onChange={(e) => setTipoCarga(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none bg-white focus:border-[#008b9c]">
                                <option>FCL (Contenedor Exclusivo)</option>
                                <option>LCL (Carga Suelta)</option>
                            </select>
                        </div>

                        {/* Prioridad */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prioridad</label>
                            <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none bg-white focus:border-[#008b9c]">
                                <option>Normal</option>
                                <option>Alta</option>
                                <option>Urgente</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Puerto de Origen</label>
                            <input type="text" value={puertoOrigen} onChange={(e) => setPuertoOrigen(e.target.value)} placeholder="Ej. Yantian, China" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] outline-none" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Puerto de Destino</label>
                            <input type="text" value={puertoDestino} onChange={(e) => setPuertoDestino(e.target.value)} placeholder="Ej. Callao, Perú" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] outline-none" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fecha Estimada Arribo (ETA)</label>
                            <input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] outline-none text-gray-600" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Asignar Área Técnica</label>
                            <select value={areaTecnica} onChange={(e) => setAreaTecnica(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none bg-white focus:border-[#008b9c]">
                                <option>Operaciones Marítimas</option>
                                <option>Aduanas</option>
                                <option>Transporte Terrestre</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Observaciones */}
                    <div className="mb-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Observaciones</label>
                        <textarea 
                            rows="2" 
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Detalles adicionales sobre la carga, requerimientos especiales del cliente..." 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-[#008b9c] focus:ring-1 focus:ring-[#008b9c] outline-none resize-none"
                        ></textarea>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
                        <button type="button" className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`px-6 py-2.5 bg-[#008b9c] hover:bg-[#007685] rounded-md text-sm font-semibold text-white shadow-sm transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {loading ? 'Procesando...' : 'Crear Despacho'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}