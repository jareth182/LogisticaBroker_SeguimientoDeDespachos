import React, { useState, useEffect } from 'react';

export default function Documentos({ onNavigate }) {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [filtro, setFiltro] = useState('todos');
    const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

    const API_BASE_URL = 'http://localhost:5018/api';

    useEffect(() => {
        cargarDocumentos();
    }, []);

    const cargarDocumentos = async () => {
        setLoading(true);
        try {
            // Obtener idEmpresa del usuario logueado
            const userData = localStorage.getItem('usuario');
            const idEmpresa = userData ? JSON.parse(userData).idEmpresa : null;
            if (!idEmpresa) { setDocumentos([]); setLoading(false); return; }

            const response = await fetch(`${API_BASE_URL}/contrato/empresa/${idEmpresa}`);
            if (response.ok) {
                const contratos = await response.json();
                const documentosMapeados = contratos.map(c => ({
                    id: c.id,
                    nombre: c.titulo || `Contrato #${c.id}`,
                    tipo: c.tipo || 'Contrato',
                    estado: c.estado === 'Firmado' ? 'Firmado' : c.estado === 'Pendiente' ? 'Pendiente' : c.estado,
                    fechaCreacion: c.fechaCreacion,
                    fechaFirma: c.fechaFirma,
                    urlDescarga: `/api/contrato/${c.id}/documento`,
                    tieneSelloDigital: c.tieneSelloDigital || false
                }));
                setDocumentos(documentosMapeados);
            } else {
                setDocumentos([]);
            }
        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: 'Error al cargar los documentos.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDescargar = async (documento) => {
        try {
            const token = localStorage.getItem('token') || '';
            const response = await fetch(`${API_BASE_URL}/contrato/${documento.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo obtener el contrato');
            const data = await response.json();

            const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
            const firmante = userData.nombreCompleto || data.nombreContacto || 'Representante Legal';
            const fechaFirma = data.fechaFirma
                ? new Date(data.fechaFirma).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
            const numeroContrato = data.numeroContrato || `CTR-${documento.id}`;
            const empresa = data.nombreEmpresa || '';

            const firmaImg = data.firmaDigital && data.firmaDigital.startsWith('data:image')
                ? `<img src="${data.firmaDigital}" style="height:64px;max-width:220px;border:1px solid #ccc;border-radius:4px;background:#fff;" />`
                : '<div style="height:64px;display:flex;align-items:center;justify-content:center;color:#aaa;font-style:italic;font-size:10pt;">[Firma no disponible]</div>';

            const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Contrato de Servicios Aduaneros</title>
<style>
  body{font-family:"Times New Roman",serif;font-size:11pt;max-width:820px;margin:30px auto;padding:0 50px;color:#111;line-height:1.6}
  h1{font-size:13pt;text-align:center;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px}
  .subtitle{text-align:center;font-size:9.5pt;color:#555;margin-bottom:28px}
  h2{font-size:10pt;text-transform:uppercase;letter-spacing:.8px;margin:18px 0 6px;border-bottom:1px solid #ddd;padding-bottom:3px}
  p,li{margin:5px 0}
  ol{padding-left:22px}
  .firma-section{margin-top:40px;padding-top:20px;border-top:2px solid #1a2540}
  .firma-row{display:flex;justify-content:space-between;margin-top:28px;gap:40px}
  .firma-block{flex:1;text-align:center}
  .firma-line{height:1px;background:#111;margin:30px 0 6px}
  .firma-name{font-size:9.5pt;font-weight:bold;margin:2px 0}
  .firma-cargo{font-size:9pt;color:#555}
  .sello{display:inline-block;border:2px solid #1a2540;color:#1a2540;padding:5px 16px;font-size:9pt;font-weight:bold;letter-spacing:2px;margin-top:24px;text-transform:uppercase}
  @media print{body{margin:10px}}
</style>
</head>
<body>
<p style="text-align:center;font-size:9pt;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Logística Broker Perú S.A.C.</p>
<h1>Contrato de Prestación de Servicios Aduaneros</h1>
<p class="subtitle">Documento Nº ${numeroContrato}</p>

<h2>Partes Contratantes</h2>
<p>De una parte, <strong>LOGÍSTICA BROKER PERÚ S.A.C.</strong>, con RUC N° 20123456789, domicilio en Av. Mariscal La Mar 555, Miraflores, Lima, Perú, debidamente representada por su Gerente General, en adelante denominada <strong>"LA AGENCIA"</strong>.</p>
<p>Y de otra parte, <strong>${empresa || 'EL CLIENTE'}</strong>, que al momento de la firma digital acredita su identidad mediante los documentos legales adjuntos al presente proceso de onboarding, en adelante denominada <strong>"EL CLIENTE"</strong>.</p>

<h2>Cláusula Primera – Objeto del Contrato</h2>
<p>LA AGENCIA se compromete a prestar servicios profesionales de agenciamiento aduanero, incluyendo gestión de despachos de importación y exportación, clasificación arancelaria, trámites ante la SUNAT y SENASA, así como trazabilidad en tiempo real de todos los procesos logísticos.</p>

<h2>Cláusula Segunda – Obligaciones de la Agencia</h2>
<ol>
<li>Gestionar los despachos aduaneros dentro de los plazos establecidos por la normativa vigente.</li>
<li>Proporcionar acceso al sistema de trazabilidad en línea con actualización en tiempo real.</li>
<li>Mantener la confidencialidad absoluta de la información del cliente.</li>
<li>Emitir liquidaciones detalladas de todos los gastos incurridos en cada despacho.</li>
<li>Designar un ejecutivo de cuenta dedicado para atención personalizada.</li>
</ol>

<h2>Cláusula Tercera – Obligaciones del Cliente</h2>
<ol>
<li>Proporcionar la documentación requerida en los plazos acordados por las partes.</li>
<li>Efectuar los pagos de honorarios y gastos en los términos pactados.</li>
<li>Comunicar oportunamente cualquier modificación en la naturaleza de las mercancías.</li>
<li>Mantener actualizados los poderes y documentos legales de representación.</li>
</ol>

<h2>Cláusula Cuarta – Honorarios y Condiciones de Pago</h2>
<p>Los honorarios serán determinados en función del tipo de despacho, el valor de la mercancía y los servicios adicionales requeridos. Las liquidaciones se emitirán dentro de los 5 días hábiles posteriores al levante de la mercancía.</p>

<h2>Cláusula Quinta – Plazo del Contrato</h2>
<p>El presente contrato entrará en vigencia a partir de la fecha de su firma digital y tendrá una duración de doce (12) meses, renovándose automáticamente por períodos iguales salvo comunicación en contrario con 30 días de anticipación.</p>

<h2>Cláusula Sexta – Resolución del Contrato</h2>
<p>Cualquiera de las partes podrá resolver el presente contrato mediante comunicación escrita con 30 días de anticipación, o de manera inmediata ante incumplimiento grave de las obligaciones establecidas.</p>

<h2>Cláusula Sétima – Protección de Datos</h2>
<p>EL CLIENTE autoriza el tratamiento de sus datos personales y empresariales exclusivamente para los fines relacionados con los servicios contratados, de conformidad con la Ley N° 29733 de Protección de Datos Personales y su reglamento.</p>

<h2>Cláusula Octava – Jurisdicción</h2>
<p>Para la resolución de cualquier controversia derivada del presente contrato, las partes se someten expresamente a la jurisdicción de los Juzgados y Tribunales de la ciudad de Lima, Perú.</p>

<div class="firma-section">
  <p><strong>En señal de conformidad, las partes suscriben el presente contrato en Lima, Perú, con fecha ${fechaFirma}.</strong></p>
  <div class="firma-row">
    <div class="firma-block">
      <div class="firma-line"></div>
      <p class="firma-name">LOGÍSTICA BROKER PERÚ S.A.C.</p>
      <p class="firma-cargo">Gerente General</p>
    </div>
    <div class="firma-block">
      <div style="display:flex;justify-content:center;margin-bottom:6px">${firmaImg}</div>
      <div class="firma-line"></div>
      <p class="firma-name">${firmante}</p>
      <p class="firma-cargo">Representante Legal — EL CLIENTE</p>
    </div>
  </div>
  <div style="text-align:center;margin-top:28px">
    <span class="sello">✓ Firmado Digitalmente</span>
    <p style="font-size:8.5pt;color:#888;margin-top:8px">Documento firmado digitalmente el ${fechaFirma} · Logística Broker Perú S.A.C.</p>
  </div>
</div>
</body>
</html>`;

            const win = window.open('', '_blank');
            if (!win) { setMensaje({ tipo: 'error', texto: 'Permite ventanas emergentes para descargar el documento.' }); return; }
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 500);
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al generar el documento.' });
        }
    };

    const documentosFiltrados = documentos.filter(doc => {
        if (filtro === 'todos') return true;
        if (filtro === 'firmados') return doc.estado === 'Firmado';
        if (filtro === 'pendientes') return doc.estado === 'Pendiente';
        return true;
    });

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Firmado':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'Finalizado':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Pendiente':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'Contrato':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'DAM':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case 'Autorización':
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Documentos</h2>
                    <p className="text-gray-500 mb-6 text-sm">Gestiona y descarga todos tus documentos legales y operativos.</p>

                    {/* Alerta de mensajes */}
                    {mensaje && (
                        <div className={`p-4 mb-6 rounded-md text-sm font-medium ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {mensaje.texto}
                        </div>
                    )}


                    {/* Lista de documentos */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8] mx-auto mb-4"></div>
                            <p className="text-gray-500">Cargando documentos...</p>
                        </div>
                    ) : documentosFiltrados.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 font-medium">No se encontraron documentos</p>
                            <p className="text-gray-400 text-sm mt-1">No hay documentos que coincidan con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documentosFiltrados.map((documento) => (
                                <div
                                    key={documento.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                                    {getTipoIcon(documento.tipo)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                    {documento.nombre}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        <span>{documento.tipo}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{new Date(documento.fechaCreacion).toLocaleDateString('es-PE')}</span>
                                                    </span>
                                                    {documento.fechaFirma && (
                                                        <span className="flex items-center space-x-1">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>Firmado: {new Date(documento.fechaFirma).toLocaleDateString('es-PE')}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoColor(documento.estado)}`}>
                                                    {documento.estado}
                                                </span>
                                                {documento.tieneSelloDigital && (
                                                    <div className="flex items-center space-x-1 text-green-600">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        <span className="text-xs font-medium">Sello Digital</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex space-x-2">
                                                {documento.estado === 'Firmado' && documento.tieneSelloDigital && (
                                                    <button
                                                        onClick={() => handleDescargar(documento)}
                                                        className="px-4 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#009bc2] transition-colors flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>Descargar</span>
                                                    </button>
                                                )}

                                                {documento.estado === 'Pendiente' && documento.tipo === 'Contrato' && (
                                                    <button
                                                        onClick={() => onNavigate?.('firma-contrato')}
                                                        className="px-4 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#009bc2] transition-colors flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                        <span>Firmar</span>
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel de vista previa del documento */}
                {documentoSeleccionado && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">{documentoSeleccionado.nombre}</h3>
                                    <button
                                        onClick={() => setDocumentoSeleccionado(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-500">Tipo</span>
                                            <p className="font-medium text-gray-800">{documentoSeleccionado.tipo}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Estado</span>
                                            <p className="font-medium">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(documentoSeleccionado.estado)}`}>
                                                    {documentoSeleccionado.estado}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Fecha de Creación</span>
                                            <p className="font-medium text-gray-800">{new Date(documentoSeleccionado.fechaCreacion).toLocaleDateString('es-PE')}</p>
                                        </div>
                                        {documentoSeleccionado.fechaFirma && (
                                            <div>
                                                <span className="text-sm text-gray-500">Fecha de Firma</span>
                                                <p className="font-medium text-gray-800">{new Date(documentoSeleccionado.fechaFirma).toLocaleDateString('es-PE')}</p>
                                            </div>
                                        )}
                                    </div>

                                    {documentoSeleccionado.tieneSelloDigital && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 text-green-700">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <span className="font-medium text-sm">Documento con Sello Digital Válido</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">Vista previa del documento</p>
                                        <p className="text-gray-400 text-xs mt-1">{documentoSeleccionado.nombre}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                    {documentoSeleccionado.estado === 'Firmado' && documentoSeleccionado.tieneSelloDigital && (
                                        <button
                                            onClick={() => handleDescargar(documentoSeleccionado)}
                                            className="px-4 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#009bc2] transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Descargar PDF</span>
                                        </button>
                                    )}
                                    {documentoSeleccionado.estado === 'Pendiente' && documentoSeleccionado.tipo === 'Contrato' && (
                                        <button
                                            onClick={() => { setDocumentoSeleccionado(null); onNavigate?.('firma-contrato'); }}
                                            className="px-4 py-2 bg-[#00b4d8] text-white text-sm font-medium rounded-lg hover:bg-[#009bc2] transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            <span>Firmar Documento</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDocumentoSeleccionado(null)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
