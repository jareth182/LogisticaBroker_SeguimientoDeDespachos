import { useState, useRef, useCallback, useEffect } from 'react';

const API = 'http://localhost:5018/api/contrato';

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

export default function FirmaContrato({ onFirmado, onCancelar }) {
  const canvasRef    = useRef(null);
  const isDrawingRef = useRef(false);
  const [hasFirma, setHasFirma]               = useState(false);
  const [aceptaTerminos, setAceptaTerminos]   = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [firmado, setFirmado]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [contratoId, setContratoId]           = useState(null);

  /* ── Cargar ID del contrato pendiente de la empresa ── */
  useEffect(() => {
    const cargar = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
        const idEmpresa = userData.idEmpresa;
        if (!idEmpresa) { setContratoId(1); return; }
        const res = await fetch(`${API}/empresa/${idEmpresa}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        if (res.ok) {
          const lista = await res.json();
          const pendiente = lista.find(c => c.estado === 'Pendiente') || lista[0];
          if (pendiente) setContratoId(pendiente.id);
          else setContratoId(1);
        } else {
          setContratoId(1);
        }
      } catch {
        setContratoId(1);
      }
    };
    cargar();
  }, []);

  /* ── Canvas: dibujo con mouse y touch ── */
  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a2540';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasFirma(true);
  }, []);

  const endDraw = useCallback((e) => {
    if (e) e.preventDefault();
    isDrawingRef.current = false;
  }, []);

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasFirma(false);
  };

  /* ── Enviar firma al backend ── */
  const handleFirmar = async () => {
    if (!hasFirma || !aceptaTerminos || loading) return;
    setLoading(true);
    setError(null);
    try {
      const canvas   = canvasRef.current;
      const firmaB64 = canvas.toDataURL('image/png');
      const userData = JSON.parse(localStorage.getItem('usuario') || '{}');
      const id       = contratoId || 1;

      const res = await fetch(`${API}/${id}/firmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          nombreFirmante:     userData.nombreCompleto || '',
          emailFirmante:      userData.correo || '',
          cargoFirmante:      'Representante Legal',
          firmaDigital:       firmaB64,
          certificadoDigital: `cert_${Date.now()}`,
          ipAddress:          '',
          userAgent:          navigator.userAgent,
        }),
      });

      if (res.ok) {
        const updatedUser = { ...userData, estadoEmpresa: 'Afiliado Activo' };
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
        setFirmado(true);
        setTimeout(() => { if (onFirmado) onFirmado(updatedUser); }, 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al procesar la firma. Inténtalo nuevamente.');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Pantalla de éxito ── */
  if (firmado) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-14 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Contrato firmado!</h2>
          <p className="text-sm text-gray-500">Tu cuenta ha sido activada. Redirigiendo al sistema…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full min-h-0">

      {/* ══ PANEL IZQUIERDO: Visor de contrato ══ */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">

        {/* Barra del visor */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-sm font-medium text-gray-700 tracking-tight">CONTRATO_SERVICIOS_ADUANEROS.PDF</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Buscar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors" title="Descargar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Texto del contrato */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 pb-6 border-b border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Logística Broker Perú S.A.C.</p>
              <h2 className="text-base font-bold text-gray-900 mb-1">
                CONTRATO DE PRESTACIÓN DE SERVICIOS ADUANEROS
              </h2>
              <p className="text-xs text-gray-500">Documento Nº C-2024-0891</p>
            </div>

            <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Partes Contratantes</p>
                <p>De una parte, <strong>LOGÍSTICA BROKER PERÚ S.A.C.</strong>, con RUC N° 20123456789, domicilio en Av. Mariscal La Mar 555, Miraflores, Lima, Perú, debidamente representada por su Gerente General, en adelante denominada <strong>"LA AGENCIA"</strong>.</p>
                <p className="mt-2">Y de otra parte, la empresa identificada como <strong>"EL CLIENTE"</strong>, que al momento de la firma digital acredita su identidad mediante los documentos legales adjuntos al presente proceso de onboarding.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Primera – Objeto del Contrato</p>
                <p>LA AGENCIA se compromete a prestar servicios profesionales de agenciamiento aduanero, incluyendo gestión de despachos de importación y exportación, clasificación arancelaria, trámites ante la SUNAT y SENASA, así como trazabilidad en tiempo real de todos los procesos logísticos.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Segunda – Obligaciones de la Agencia</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Gestionar los despachos aduaneros dentro de los plazos establecidos por la normativa vigente.</li>
                  <li>Proporcionar acceso al sistema de trazabilidad en línea con actualización en tiempo real.</li>
                  <li>Mantener la confidencialidad absoluta de la información del cliente.</li>
                  <li>Emitir liquidaciones detalladas de todos los gastos incurridos en cada despacho.</li>
                  <li>Designar un ejecutivo de cuenta dedicado para atención personalizada.</li>
                </ol>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Tercera – Obligaciones del Cliente</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Proporcionar la documentación requerida en los plazos acordados por las partes.</li>
                  <li>Efectuar los pagos de honorarios y gastos en los términos pactados.</li>
                  <li>Comunicar oportunamente cualquier modificación en la naturaleza de las mercancías.</li>
                  <li>Mantener actualizados los poderes y documentos legales de representación.</li>
                </ol>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Cuarta – Honorarios y Condiciones de Pago</p>
                <p>Los honorarios serán determinados en función del tipo de despacho, el valor de la mercancía y los servicios adicionales requeridos. Las liquidaciones se emitirán dentro de los 5 días hábiles posteriores al levante de la mercancía.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Quinta – Plazo del Contrato</p>
                <p>El presente contrato entrará en vigencia a partir de la fecha de su firma digital y tendrá una duración de doce (12) meses, renovándose automáticamente por períodos iguales salvo comunicación en contrario con 30 días de anticipación.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Sexta – Resolución del Contrato</p>
                <p>Cualquiera de las partes podrá resolver el presente contrato mediante comunicación escrita con 30 días de anticipación, o de manera inmediata ante incumplimiento grave de las obligaciones establecidas.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Sétima – Protección de Datos</p>
                <p>EL CLIENTE autoriza el tratamiento de sus datos personales y empresariales exclusivamente para los fines relacionados con los servicios contratados, de conformidad con la Ley N° 29733 de Protección de Datos Personales y su reglamento.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">Cláusula Octava – Jurisdicción</p>
                <p>Para la resolución de cualquier controversia derivada del presente contrato, las partes se someten expresamente a la jurisdicción de los Juzgados y Tribunales de la ciudad de Lima, Perú.</p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <span className="inline-block text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold border border-gray-200 px-5 py-1.5 rounded select-none">
                PREVIEW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PANEL DERECHO: Panel de firma ══ */}
      <div className="w-96 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Firmar Contrato Servicios</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Por favor, lea el contrato detenidamente y realice su firma en el recuadro para proceder con la formalización de su cuenta.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Área de firma */}
          <div className="mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Firma Digital</p>
            <div
              className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden"
              style={{ height: 180 }}
            >
              {!hasFirma && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <span className="text-sm text-gray-400">Firme aquí</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={384}
                height={180}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="flex justify-end mt-1.5">
              <button
                onClick={limpiarFirma}
                className="text-xs text-[#4a7fa5] hover:text-[#1a2540] transition-colors font-medium"
              >
                Limpiar Firma
              </button>
            </div>
          </div>

          {/* Checkbox términos */}
          <div className="my-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={e => setAceptaTerminos(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1a2540] cursor-pointer shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                He leído y acepto los términos del{' '}
                <span className="text-[#4a7fa5] font-medium">Contrato de Prestación de Servicios Aduaneros</span>
                {' '}y la{' '}
                <span className="text-[#4a7fa5] font-medium">Política de Privacidad</span>.
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={handleFirmar}
              disabled={!hasFirma || !aceptaTerminos || loading}
              className="w-full py-3 bg-[#1a2540] text-white text-sm font-bold rounded-lg hover:bg-[#243050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Procesando…
                </>
              ) : 'ACEPTAR Y FIRMAR'}
            </button>
            <button
              onClick={onCancelar}
              disabled={loading}
              className="w-full py-3 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              CANCELAR
            </button>
          </div>
        </div>

        {/* Footer con badges */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Firma Encriptada
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Validez Legal
          </div>
        </div>
      </div>
    </div>
  );
}
