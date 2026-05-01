import React, { useState, useEffect } from 'react';

export default function CrearDespacho() {
    // Estados del formulario
    const [busqueda, setBusqueda] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [codigoBl, setCodigoBl] = useState('');
    
    // Estados de la UI (Carga y notificaciones)
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // URL base de tu backend (Puerto 5018 según tu launchSettings.json)
    const API_BASE_URL = 'http://localhost:5018/api/Despachos';

    // T30: Efecto para buscar clientes dinámicamente
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
                console.error("Error al buscar clientes:", error);
            }
        };

        // Debounce de 300ms para no saturar el servidor al teclear rápido
        const timeoutId = setTimeout(() => buscarClientes(), 300);
        return () => clearTimeout(timeoutId);
    }, [busqueda]);

    // Función para manejar la selección del autocompletado
    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setBusqueda(`${cliente.ruc} - ${cliente.razonSocial}`);
        setClientes([]); // Ocultamos la lista
    };

    // T31: Función para enviar el formulario y crear el despacho
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
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idEmpresa: clienteSeleccionado.idEmpresa,
                    codigoBl: codigoBl.toUpperCase() // Aseguramos que el BL vaya en mayúsculas
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ 
                    tipo: 'exito', 
                    texto: `${data.mensaje}. Código interno: ${data.codigoOrden}` 
                });
                
                // Limpiamos el formulario tras el éxito
                setCodigoBl('');
                setBusqueda('');
                setClienteSeleccionado(null);
            } else {
                setMensaje({ tipo: 'error', texto: data.mensaje || 'Error al aperturar el expediente.' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear despacho de importación</h2>
            <p className="text-gray-500 mb-6 text-sm">Apertura operativa de la carga referenciando el conocimiento de embarque.</p>
            
            {/* Alerta de mensajes (Éxito o Error) */}
            {mensaje && (
                <div className={`p-4 mb-6 rounded-md text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* T30: Selector Dinámico de Clientes */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Cliente (Importador) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setClienteSeleccionado(null);
                            }}
                            placeholder="Buscar por RUC o Razón Social..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                            autoComplete="off"
                        />
                        
                        {/* Dropdown de resultados */}
                        {clientes.length > 0 && (
                            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {clientes.map((cliente) => (
                                    <li 
                                        key={cliente.idEmpresa}
                                        onClick={() => seleccionarCliente(cliente)}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                    >
                                        <div className="font-semibold text-gray-800 text-sm">{cliente.razonSocial}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">RUC: {cliente.ruc}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* T32: Input de Bill of Lading */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Bill of Lading (BL) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={codigoBl}
                            onChange={(e) => setCodigoBl(e.target.value)}
                            placeholder="Ej. MSCU1234567"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all uppercase text-sm"
                        />
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
                    <button 
                        type="button"
                        onClick={() => { setCodigoBl(''); setBusqueda(''); setClienteSeleccionado(null); setMensaje(null); }}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Limpiar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Procesando...' : 'Crear Despacho'}
                    </button>
                </div>
            </form>
        </div>
    );
}