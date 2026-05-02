import React, { useState, useEffect } from 'react';

export default function TrackingEnvios() {
    const [despachos, setDespachos] = useState([]);
    const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [etapas, setEtapas] = useState([]);

    const API_BASE_URL = 'http://localhost:5019/api';

    useEffect(() => {
        cargarDespachos();
        cargarEtapas();
    }, []);

    const cargarDespachos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/despacho/activos`);
            if (response.ok) {
                const data = await response.json();
                setDespachos(data);
            }
        } catch (error) {
            console.error("Error al cargar despachos:", error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEtapas = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/etapa/tipos`);
            if (response.ok) {
                const data = await response.json();
                setEtapas(data);
            }
        } catch (error) {
            console.error("Error al cargar etapas:", error);
        }
    };

    const handleSeleccionarDespacho = async (despacho) => {
        setDespachoSeleccionado(despacho);
        // Cargar etapas específicas del despacho
        try {
            const response = await fetch(`${API_BASE_URL}/despacho/${despacho.idDespacho}/etapas`);
            if (response.ok) {
                const etapasDespacho = await response.json();
                setDespachoSeleccionado(prev => ({ ...prev, etapas: etapasDespacho }));
            }
        } catch (error) {
            console.error("Error al cargar etapas del despacho:", error);
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Completado': return 'text-green-600 bg-green-50 border-green-200';
            case 'En Proceso': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Pendiente': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getProgresoColor = (porcentaje) => {
        if (porcentaje >= 80) return 'bg-green-500';
        if (porcentaje >= 50) return 'bg-blue-500';
        if (porcentaje >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8] mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando despachos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* Lista de despachos */}
            <div className={`${despachoSeleccionado ? 'w-1/3' : 'w-full'} pr-4 border-r border-gray-200`}>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Tracking de Envíos</h2>
                    <p className="text-gray-500 text-sm">Monitorea el estado de tus despachos en tiempo real</p>
                </div>

                <div className="space-y-4">
                    {despachos.map((despacho) => (
                        <div
                            key={despacho.idDespacho}
                            onClick={() => handleSeleccionarDespacho(despacho)}
                            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                                despachoSeleccionado?.idDespacho === despacho.idDespacho
                                    ? 'border-[#00b4d8] shadow-md'
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{despacho.codigoBl}</h3>
                                    <p className="text-sm text-gray-500">{despacho.nave}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(despacho.estado)}`}>
                                    {despacho.estado}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Origen:</span>
                                    <span className="font-medium">{despacho.origen}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Destino:</span>
                                    <span className="font-medium">{despacho.destino}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">ETA:</span>
                                    <span className="font-medium">{new Date(despacho.eta).toLocaleDateString('es-PE')}</span>
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progreso</span>
                                    <span>{despacho.porcentajeProgreso}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getProgresoColor(despacho.porcentajeProgreso)}`}
                                        style={{ width: `${despacho.porcentajeProgreso}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel lateral de detalles */}
            {despachoSeleccionado && (
                <div className="flex-1 pl-4">
                    {/* Información general */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{despachoSeleccionado.codigoBl}</h3>
                            <button
                                onClick={() => setDespachoSeleccionado(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-500">Nave</span>
                                <p className="font-medium text-gray-800">{despachoSeleccionado.nave}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Contenedor</span>
                                <p className="font-medium text-gray-800">{despachoSeleccionado.contenedor}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Origen</span>
                                <p className="font-medium text-gray-800">{despachoSeleccionado.origen}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Destino</span>
                                <p className="font-medium text-gray-800">{despachoSeleccionado.destino}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Mercancía</span>
                                <p className="font-medium text-gray-800">{despachoSeleccionado.mercancia}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">ETA</span>
                                <p className="font-medium text-gray-800">{new Date(despachoSeleccionado.eta).toLocaleDateString('es-PE')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Línea de tiempo de etapas */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Etapas del Proceso</h3>
                        
                        <div className="relative">
                            {/* Línea vertical */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                            
                            {/* Etapas */}
                            <div className="space-y-6">
                                {(despachoSeleccionado.etapas || []).map((etapa, index) => {
                                    const isCompletado = etapa.estado === 'Completado';
                                    const isEnProceso = etapa.estado === 'En Proceso';
                                    
                                    return (
                                        <div key={etapa.idEtapa} className="flex items-start">
                                            {/* Círculo de estado */}
                                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                                                isCompletado ? 'bg-green-500' : isEnProceso ? 'bg-blue-500' : 'bg-gray-300'
                                            }`}>
                                                {isCompletado ? (
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : isEnProceso ? (
                                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                                ) : (
                                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                )}
                                            </div>
                                            
                                            {/* Contenido de la etapa */}
                                            <div className="ml-4 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`font-semibold ${
                                                        isCompletado ? 'text-green-600' : isEnProceso ? 'text-blue-600' : 'text-gray-600'
                                                    }`}>
                                                        {etapa.tipoEtapa?.nombre || `Etapa ${index + 1}`}
                                                    </h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(etapa.estado)}`}>
                                                        {etapa.estado}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {etapa.tipoEtapa?.descripcion || 'Procesando etapa...'}
                                                </p>
                                                {etapa.fechaHora && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(etapa.fechaHora).toLocaleString('es-PE')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
