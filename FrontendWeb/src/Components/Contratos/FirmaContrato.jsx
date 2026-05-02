import React, { useState, useEffect } from 'react';

export default function FirmaContrato() {
    const [contrato, setContrato] = useState(null);
    const [mostrarPasarela, setMostrarPasarela] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [firmaProcesada, setFirmaProcesada] = useState(false);
    const [urlDocumento, setUrlDocumento] = useState(null);

    const API_BASE_URL = 'http://localhost:5018/api/contrato';

    useEffect(() => {
        // Simular la carga de un contrato pendiente de firma
        const cargarContrato = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/1`);
                if (response.ok) {
                    const data = await response.json();
                    setContrato(data);
                }
            } catch (error) {
                console.error("Error al cargar contrato:", error);
            }
        };

        cargarContrato();
    }, []);

    const handleFirmarDocumento = () => {
        setMostrarPasarela(true);
        setMensaje(null);
    };

    const handleProcesarFirma = async (firmaData) => {
        setLoading(true);
        setMensaje(null);

        try {
            const response = await fetch(`${API_BASE_URL}/1/firmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(firmaData)
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({
                    tipo: 'exito',
                    texto: 'Contrato firmado exitosamente. Su estado ha sido actualizado a "Afiliado Activo".'
                });
                setFirmaProcesada(true);
                setUrlDocumento(data.urlAlmacenamiento);
                
                // Actualizar estado del contrato
                setContrato(prev => ({
                    ...prev,
                    estado: 'Firmado',
                    fechaFirma: new Date().toISOString()
                }));
            } else {
                setMensaje({
                    tipo: 'error',
                    texto: data.error || 'Error al procesar la firma.'
                });
            }
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
            });
        } finally {
            setLoading(false);
            setMostrarPasarela(false);
        }
    };

    const handleDescargarContrato = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/1/documento`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contrato_${contrato?.numeroContrato || 'firmado'}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error al descargar el contrato.'
            });
        }
    };

    if (!contrato) {
        return (
            <div className="max-w-4xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8] mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando información del contrato...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Firma Digital de Contrato</h2>
            <p className="text-gray-500 mb-6 text-sm">Proceso seguro de firma digital para su contrato logístico.</p>

            {/* Alerta de mensajes */}
            {mensaje && (
                <div className={`p-4 mb-6 rounded-md text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {mensaje.texto}
                </div>
            )}

            {/* Información del contrato */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500">Número de Contrato:</span>
                        <p className="font-medium text-gray-800">{contrato.numeroContrato}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Tipo:</span>
                        <p className="font-medium text-gray-800">{contrato.tipoContrato}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Fecha de Creación:</span>
                        <p className="font-medium text-gray-800">{new Date(contrato.fechaCreacion).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">Estado:</span>
                        <p className={`font-medium ${contrato.estado === 'Firmado' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {contrato.estado === 'Firmado' ? '✓ Firmado' : '⏳ Pendiente de Firma'}
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <span className="text-sm text-gray-500">Descripción:</span>
                    <p className="font-medium text-gray-800">{contrato.descripcion}</p>
                </div>
            </div>

            {/* Acciones disponibles */}
            <div className="border-t border-gray-100 pt-6">
                {!firmaProcesada ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-blue-800">Información Importante</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Al presionar "Firmar Documento", será redirigido a nuestra pasarela segura de firma digital. 
                                        El proceso es seguro y cumple con los estándares de firma electrónica vigentes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleFirmarDocumento}
                            disabled={loading}
                            className={`w-full md:w-auto px-6 py-3 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Procesando...' : '📝 Firmar Documento'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-green-800">Contrato Firmado Exitosamente</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Su contrato ha sido firmado digitalmente y su perfil ha sido actualizado a "Afiliado Activo". 
                                        Puede descargar una copia del contrato con el sello digital visible.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleDescargarContrato}
                                className="px-6 py-3 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors focus:ring-4 focus:ring-cyan-100 flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>📄 Descargar Contrato Firmado</span>
                            </button>
                            
                            <button
                                onClick={() => window.location.href = '/documentos'}
                                className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Mis Documentos</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pasarela de Firma Digital Modal */}
            {mostrarPasarela && (
                <PasarelaFirmaDigital
                    contrato={contrato}
                    onProcesarFirma={handleProcesarFirma}
                    onCancelar={() => setMostrarPasarela(false)}
                />
            )}
        </div>
    );
}

// Componente de Pasarela de Firma Digital
function PasarelaFirmaDigital({ contrato, onProcesarFirma, onCancelar }) {
    const [paso, setPaso] = useState(1);
    const [formData, setFormData] = useState({
        nombreFirmante: '',
        emailFirmante: '',
        cargoFirmante: '',
        aceptaTerminos: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simular proceso de firma digital
        setTimeout(() => {
            const firmaData = {
                nombreFirmante: formData.nombreFirmante,
                emailFirmante: formData.emailFirmante,
                cargoFirmante: formData.cargoFirmante,
                firmaDigital: `firma_digital_${Date.now()}`,
                certificadoDigital: `cert_${Date.now()}`,
                ipAddress: '192.168.1.1',
                userAgent: navigator.userAgent
            };

            onProcesarFirma(firmaData);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Pasarela Segura de Firma Digital</h3>
                        <button
                            onClick={onCancelar}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Indicadores de paso */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${paso >= 1 ? 'bg-[#00b4d8] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                1
                            </div>
                            <div className={`w-16 h-1 ${paso >= 2 ? 'bg-[#00b4d8]' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${paso >= 2 ? 'bg-[#00b4d8] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                2
                            </div>
                            <div className={`w-16 h-1 ${paso >= 3 ? 'bg-[#00b4d8]' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${paso >= 3 ? 'bg-[#00b4d8] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                3
                            </div>
                        </div>
                    </div>

                    {paso === 1 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Verificación de Identidad</h4>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    Por favor, ingrese sus datos personales para verificar su identidad antes de proceder con la firma digital.
                                </p>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); setPaso(2); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nombre Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombreFirmante}
                                        onChange={(e) => setFormData({...formData, nombreFirmante: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                                        placeholder="Ingrese su nombre completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Correo Electrónico <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.emailFirmante}
                                        onChange={(e) => setFormData({...formData, emailFirmante: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Cargo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cargoFirmante}
                                        onChange={(e) => setFormData({...formData, cargoFirmante: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-all text-sm"
                                        placeholder="Ej. Gerente General"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onCancelar}
                                        className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {paso === 2 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Revisión del Contrato</h4>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h5 className="font-medium text-gray-800 mb-2">{contrato?.titulo}</h5>
                                <p className="text-sm text-gray-600 mb-3">{contrato?.descripcion}</p>
                                <div className="text-xs text-gray-500">
                                    <p>Número: {contrato?.numeroContrato}</p>
                                    <p>Fecha: {new Date(contrato?.fechaCreacion).toLocaleDateString('es-PE')}</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    Por favor, revise cuidadosamente el contenido del contrato antes de proceder con la firma digital.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setPaso(1)}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPaso(3)}
                                    className="px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors"
                                >
                                    Aceptar y Firmar
                                </button>
                            </div>
                        </div>
                    )}

                    {paso === 3 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Procesando Firma Digital</h4>
                            <div className="text-center py-8">
                                {loading ? (
                                    <div>
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8] mx-auto mb-4"></div>
                                        <p className="text-gray-600 mb-2">Procesando firma digital...</p>
                                        <p className="text-sm text-gray-500">Por favor, espere un momento.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-800 font-medium mb-2">¡Listo para firmar!</p>
                                        <p className="text-sm text-gray-500 mb-6">Confirme para aplicar su firma digital al contrato.</p>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <label className="flex items-start space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        required
                                                        checked={formData.aceptaTerminos}
                                                        onChange={(e) => setFormData({...formData, aceptaTerminos: e.target.checked})}
                                                        className="mt-1 w-4 h-4 text-[#00b4d8] border-gray-300 rounded focus:ring-[#00b4d8]"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        Acepto los términos y condiciones del contrato y autorizo la firma digital del presente documento.
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaso(2)}
                                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!formData.aceptaTerminos}
                                                    className="px-6 py-2.5 bg-[#00b4d8] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#009bc2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Confirmar Firma
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
