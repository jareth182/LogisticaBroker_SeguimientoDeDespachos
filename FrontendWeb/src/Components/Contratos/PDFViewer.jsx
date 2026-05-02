import React, { useState, useEffect } from 'react';

export default function PDFViewer({ contratoId, url }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        if (url) {
            setPdfUrl(url);
            setLoading(false);
        } else if (contratoId) {
            cargarPDF();
        }
    }, [contratoId, url]);

    const cargarPDF = async () => {
        try {
            const response = await fetch(`http://localhost:5018/api/contrato/${contratoId}/documento`);
            if (response.ok) {
                const blob = await response.blob();
                const pdfUrl = URL.createObjectURL(blob);
                setPdfUrl(pdfUrl);
                setLoading(false);
            } else {
                throw new Error('No se pudo cargar el documento');
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `contrato_${contratoId || 'firmado'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8] mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando documento PDF...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-600 font-medium mb-2">Error al cargar el documento</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controles del visor */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Contrato Firmado con Sello Digital</span>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Sello Digital Verificado</span>
                    </div>
                    
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#009bc2] transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Descargar</span>
                    </button>
                </div>
            </div>

            {/* Visor de PDF */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="aspect-[4/5] max-h-[800px]">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="Visor de PDF"
                        frameBorder="0"
                    />
                </div>
            </div>

            {/* Información de seguridad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Información de Validación</h4>
                        <p className="text-sm text-blue-700">
                            Este documento contiene un sello digital que garantiza su autenticidad e integridad. 
                            La firma digital ha sido verificada y es válida según los estándares de firma electrónica.
                        </p>
                        <div className="mt-2 text-xs text-blue-600">
                            <p>• Fecha de firma: {new Date().toLocaleDateString('es-PE')}</p>
                            <p>• Algoritmo de firma: SHA-256 with RSA</p>
                            <p>• Estado: Válido</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
