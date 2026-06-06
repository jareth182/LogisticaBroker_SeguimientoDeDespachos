-- ============================================================
-- SEED DATA — LogisticaBroker Perú S.A.C.
-- Base de datos: PostgreSQL  |  ORM: EF Core
-- Cubre: Sprint 1 + Sprint 2 (Documentación + Facturación)
--
-- INSTRUCCIONES:
--   1. Ejecutar DESPUÉS de "dotnet ef database update"
--   2. Correr completo una sola vez (usa INSERT ... ON CONFLICT DO NOTHING)
--   3. Contraseñas hasheadas con BCrypt:
--        admin123   → hash incluido abajo
--        cliente123 → hash incluido abajo
-- ============================================================

-- ── 1. ROLES ─────────────────────────────────────────────────
INSERT INTO "Roles" ("IdRol", "NombreRol", "Descripcion") VALUES
  (1, 'Administrador', 'Acceso completo al sistema'),
  (2, 'Cliente',       'Portal de cliente — trazabilidad y documentación')
ON CONFLICT DO NOTHING;

-- ── 2. EMPRESAS ───────────────────────────────────────────────
-- Empresa 1: cliente activo con despachos (usuario cliente@test.com)
-- Empresa 2: cliente pendiente (para probar flujo onboarding)
-- Empresa 3: cliente activo extra (más despachos de prueba)
INSERT INTO "Empresas"
  ("IdEmpresa","CodigoOrden","Ruc","RazonSocial","NombreContacto","Correo","Celular","Direccion","Rubro","Estado","FechaRegistro")
VALUES
  (1, 'ORD-001', '20123456789', 'Test Logistics S.A.C.',     'Carlos Mendoza',    'contacto@testlogistics.pe', '987654321', 'Av. La Marina 2100, San Miguel, Lima',  'Importación General',   'Afiliado Activo', '2025-01-10'),
  (2, 'ORD-002', '20987654321', 'Cargo Express Perú S.A.C.', 'Ana Torres',        'atores@cargoexpress.pe',    '956123456', 'Jr. Cusco 450, Cercado de Lima',        'Logística y Transporte','Pendiente',       '2026-05-20'),
  (3, 'ORD-003', '20456789123', 'Andina Import E.I.R.L.',    'Pedro Quispe',      'pquispe@andina.pe',         '912345678', 'Calle Los Pinos 340, Surco, Lima',      'Productos Agrícolas',  'Afiliado Activo', '2025-03-15')
ON CONFLICT DO NOTHING;

-- ── 3. USUARIOS ───────────────────────────────────────────────
-- Hashes BCrypt generados para: admin123, cliente123, operativo123
-- admin@test.com      → admin123
-- cliente@test.com    → cliente123
-- operativo@test.com  → operativo123  (también IdRol=1)
INSERT INTO "Usuarios"
  ("IdUsuario","IdRol","IdEmpresa","NombreCompleto","Correo","ContrasenaHash","Estado","FechaCreacion")
VALUES
  (1, 1, NULL, 'Administrador Sistema', 'admin@test.com',
   '$2a$11$YOXRlOkdYRfzxfCFPiViUuPfhOqO1gJU.LbgGaGFBWWQlVJ.BKaKW', 'Activo', '2025-01-01 00:00:00'),

  (2, 2, 1, 'Carlos Mendoza', 'cliente@test.com',
   '$2a$11$0lz2MRoIFr2yPEMOhRAGweLEyH6t3Q/aBxGRXpqDQN4W6XnIJFnMi', 'Activo', '2025-01-10 09:00:00'),

  (3, 1, NULL, 'María Operativa', 'operativo@test.com',
   '$2a$11$OZW.mPkFn4p7hkJuW3KESO/RqyKB/MmEjUOE2Vl0n.KuuE3XhSomO', 'Activo', '2025-01-01 00:00:00'),

  (4, 2, 3, 'Pedro Quispe', 'pquispe@andina.pe',
   '$2a$11$0lz2MRoIFr2yPEMOhRAGweLEyH6t3Q/aBxGRXpqDQN4W6XnIJFnMi', 'Activo', '2025-03-15 11:00:00')
ON CONFLICT DO NOTHING;

-- ── 4. CONTRATOS DE SERVICIO ─────────────────────────────────
INSERT INTO "ContratosServicio"
  ("IdContrato","IdEmpresa","Titulo","Version","EstadoFirma","EdicionBloqueada","FechaGeneracion","FechaFirma")
VALUES
  (1, 1, 'Acuerdo de Servicios Logísticos y Mandato Electrónico', '1.0',
   'Firmado', TRUE, '2025-01-10 09:00:00', '2025-01-15 14:30:00'),

  (2, 2, 'Acuerdo de Servicios Logísticos y Mandato Electrónico', '1.0',
   'Pendiente', FALSE, '2026-05-20 10:00:00', NULL),

  (3, 3, 'Acuerdo de Servicios Logísticos y Mandato Electrónico', '1.0',
   'Firmado', TRUE, '2025-03-15 11:00:00', '2025-03-20 09:15:00')
ON CONFLICT DO NOTHING;

-- ── 5. CANALES SUNAT ──────────────────────────────────────────
INSERT INTO "CanalesSunat" ("IdCanal","NombreCanal","Descripcion","ColorHex") VALUES
  (1, 'Verde',     'Levante automático sin revisión',              '#22c55e'),
  (2, 'Naranja',   'Revisión documentaria obligatoria',           '#f97316'),
  (3, 'Rojo',      'Reconocimiento físico y documentario',        '#ef4444'),
  (4, 'Sin canal', 'Canal aún no asignado por SUNAT',             '#94a3b8')
ON CONFLICT DO NOTHING;

-- ── 6. TIPOS DE ETAPA ─────────────────────────────────────────
INSERT INTO "TiposEtapa" ("IdTipoEtapa","Nombre","Descripcion","Orden") VALUES
  (1, 'Pre-Desaduanización',  'Preparación de documentos y numeración de DAM', 1),
  (2, 'Desaduanización',      'Proceso ante SUNAT: canal, aforo y levante',    2),
  (3, 'Post-Desaduanización', 'Retiro de almacén y coordinación de transporte',3),
  (4, 'Entrega',              'Entrega final de mercancía al cliente',          4)
ON CONFLICT DO NOTHING;

-- ── 7. RESTRICCIONES LEGALES ─────────────────────────────────
INSERT INTO "RestriccionesLegales" ("IdRestriccion","Nombre","Entidad","Descripcion") VALUES
  (1, 'DIGESA — Alimentos',       'DIGESA', 'Requiere registro sanitario para alimentos y bebidas'),
  (2, 'DIGEMID — Medicamentos',   'DIGEMID','Autorización sanitaria para medicamentos e insumos médicos'),
  (3, 'SERFOR — Madera',          'SERFOR', 'Permiso CITES para especies maderables controladas'),
  (4, 'PRODUCE — Pesca',          'PRODUCE','Cuota de importación para productos hidrobiológicos'),
  (5, 'MTC — Electrónicos',       'MTC',    'Homologación de equipos de telecomunicaciones')
ON CONFLICT DO NOTHING;

-- ── 8. TIPOS DE DOCUMENTO ─────────────────────────────────────
INSERT INTO "TiposDocumento" ("IdTipoDoc","Nombre","Descripcion") VALUES
  (1, 'Acta de Constitución',        'Documento legal de constitución de la empresa'),
  (2, 'RUC',                         'Registro Único de Contribuyentes'),
  (3, 'DNI Representante Legal',     'Documento de identidad del representante legal'),
  (4, 'Conocimiento de Embarque',    'Bill of Lading o AWB del embarque'),
  (5, 'Factura Comercial',           'Invoice del proveedor extranjero'),
  (6, 'Lista de Empaque',            'Packing list de la mercancía'),
  (7, 'Certificado de Origen',       'Documento que acredita el país de origen')
ON CONFLICT DO NOTHING;

-- ── 9. DESPACHOS ──────────────────────────────────────────────
-- Despacho 1 (Empresa 1): completado al 100%
-- Despacho 2 (Empresa 1): en proceso, etapa desaduanización
-- Despacho 3 (Empresa 1): recién creado
-- Despacho 4 (Empresa 3): en proceso
-- Despacho 5 (Empresa 3): completado
INSERT INTO "Despachos"
  ("IdDespacho","IdEmpresa","IdCanal","CodigoBl","CodigoOrden","Nave","Contenedor","Origen","Destino","Eta","Mercancia","PorcentajeProgreso","Estado","FechaCreacion")
VALUES
  (1, 1, 1, 'BL2025001', 'ORD-001-01', 'MSC AURELIA',   'MSCU1234567', 'Shanghái, China',    'Callao, Perú', '2025-02-10', 'Maquinaria industrial CNC',       100, 'Completado', '2025-01-20 08:00:00'),
  (2, 1, 2, 'BL2025002', 'ORD-001-02', 'MAERSK SENANG', 'MSKU9876543', 'Busan, Corea del Sur','Callao, Perú', '2026-06-15', 'Componentes electrónicos',         50, 'En proceso', '2026-05-01 10:30:00'),
  (3, 1, 4, 'BL2025003', 'ORD-001-03', 'EVER GREET',    'EGHU4567890', 'Rotterdam, Holanda', 'Callao, Perú', '2026-07-20', 'Repuestos automotrices',            0, 'En proceso', '2026-06-01 09:00:00'),
  (4, 3, 3, 'BL2025004', 'ORD-003-01', 'SANTA ELENA',   'CSNU1122334', 'Valparaíso, Chile',  'Callao, Perú', '2026-06-28', 'Frutas frescas — uvas de mesa',    75, 'En proceso', '2026-05-10 14:00:00'),
  (5, 3, 1, 'BL2025005', 'ORD-003-02', 'CMA CGM MARCO', 'CMAU5544332', 'Guayaquil, Ecuador', 'Callao, Perú', '2025-11-30', 'Insumos agrícolas (fertilizantes)',100, 'Completado', '2025-10-15 11:00:00')
ON CONFLICT DO NOTHING;

-- ── 10. ETAPAS DE DESPACHO ────────────────────────────────────
-- Despacho 1 — todas completadas
INSERT INTO "EtapasDespacho" ("IdEtapa","IdDespacho","IdTipoEtapa","IdUsuarioResponsable","Estado","Descripcion","FechaHora") VALUES
  (1,  1, 1, 1, 'Completado', 'DAM numerada: 206-2025-10-000123. Documentos presentados a SUNAT.', '2025-02-05 09:00:00'),
  (2,  1, 2, 1, 'Completado', 'Canal Verde asignado. Levante automático otorgado.', '2025-02-11 10:30:00'),
  (3,  1, 3, 3, 'Completado', 'Mercancía retirada de ENAPU. Unidad asignada: placa ABC-123.', '2025-02-12 14:00:00'),
  (4,  1, 4, 3, 'Completado', 'Entrega realizada en planta del cliente. Acta firmada.', '2025-02-13 16:30:00'),
-- Despacho 2 — pre-desaduanización y desaduanización en progreso
  (5,  2, 1, 1, 'Completado', 'DAM numerada: 206-2026-10-001456. Documentos enviados.', '2026-05-20 09:30:00'),
  (6,  2, 2, 1, 'En proceso', 'Canal Naranja asignado. Pendiente revisión documentaria.', '2026-05-25 11:00:00'),
  (7,  2, 3, NULL,'Pendiente', NULL, '2026-05-01 10:30:00'),
  (8,  2, 4, NULL,'Pendiente', NULL, '2026-05-01 10:30:00'),
-- Despacho 3 — recién creado, todo pendiente
  (9,  3, 1, NULL,'Pendiente', NULL, '2026-06-01 09:00:00'),
  (10, 3, 2, NULL,'Pendiente', NULL, '2026-06-01 09:00:00'),
  (11, 3, 3, NULL,'Pendiente', NULL, '2026-06-01 09:00:00'),
  (12, 3, 4, NULL,'Pendiente', NULL, '2026-06-01 09:00:00'),
-- Despacho 4 — 3 etapas completadas
  (13, 4, 1, 1, 'Completado', 'Documentos presentados ante SUNAT Callao.', '2026-05-15 08:00:00'),
  (14, 4, 2, 1, 'Completado', 'Canal Rojo — aforo físico realizado sin observaciones.', '2026-05-22 10:00:00'),
  (15, 4, 3, 3, 'En proceso', 'Coordinando transporte refrigerado para frutas.', '2026-06-01 12:00:00'),
  (16, 4, 4, NULL,'Pendiente', NULL, '2026-05-10 14:00:00'),
-- Despacho 5 — todas completadas
  (17, 5, 1, 1, 'Completado', 'DAM numerada: 206-2025-10-009987.', '2025-10-20 09:00:00'),
  (18, 5, 2, 1, 'Completado', 'Canal Verde. Levante inmediato.', '2025-11-30 11:00:00'),
  (19, 5, 3, 3, 'Completado', 'Retiro completado. Unidad: placa XYZ-789.', '2025-12-01 08:30:00'),
  (20, 5, 4, 3, 'Completado', 'Entrega en almacén de Andina Import.', '2025-12-02 15:00:00')
ON CONFLICT DO NOTHING;

-- ── 11. DAMs ──────────────────────────────────────────────────
INSERT INTO "Dams"
  ("IdDam","IdDespacho","IdUsuarioCreador","ImportadorExportador","CodDocIdentificacion","DireccionImportador",
   "EmpresaTransporte","ViaTransporte","PuertoEmbarque","TerminalAlmacenamiento",
   "ValorFob","Flete","Seguro","TotalAjustes","Estado","EdicionBloqueada","FechaCreacion","FechaFinalizacion")
VALUES
  (1, 1, 1,
   'Test Logistics S.A.C.', '20123456789', 'Av. La Marina 2100, San Miguel, Lima',
   'MAERSK LINE', 'Marítimo', 'Shanghái — SGSHG', 'NEPTUNIA S.A. — Terminal 6',
   45000.00, 3200.00, 450.00, 0.00, 'Finalizado', TRUE,
   '2025-01-22 10:00:00', '2025-02-11 12:00:00'),

  (2, 2, 1,
   'Test Logistics S.A.C.', '20123456789', 'Av. La Marina 2100, San Miguel, Lima',
   'MAERSK LINE', 'Marítimo', 'Busan — KRPUS', 'ALCONSA — Muelle 7',
   28500.00, 2100.00, 285.00, 0.00, 'Borrador', FALSE,
   '2026-05-05 09:30:00', NULL),

  (3, 4, 1,
   'Andina Import E.I.R.L.', '20456789123', 'Calle Los Pinos 340, Surco, Lima',
   'CMA CGM', 'Marítimo', 'Valparaíso — CLVAP', 'RANSA COMERCIAL — Zona C',
   12000.00, 900.00, 120.00, 0.00, 'Borrador', FALSE,
   '2026-05-12 08:00:00', NULL),

  (4, 5, 1,
   'Andina Import E.I.R.L.', '20456789123', 'Calle Los Pinos 340, Surco, Lima',
   'CMA CGM', 'Marítimo', 'Guayaquil — ECGYE', 'ENAPU — Zona Franca',
   18500.00, 1400.00, 185.00, 0.00, 'Finalizado', TRUE,
   '2025-10-18 10:00:00', '2025-11-30 13:00:00')
ON CONFLICT DO NOTHING;

-- ── 12. PARTIDAS ARANCELARIAS ─────────────────────────────────
INSERT INTO "PartidasArancelarias"
  ("IdPartida","IdDam","IdDespacho","PartidaNacional","SubpartidaNaban","CantidadBultos","PesoNetoKg","PesoBrutoKg","DescripcionMercancias")
VALUES
  (1, 1, 1, '8457.10.00.00', '8457.10.00', 3, 12500.000, 13200.000, 'Centros de mecanizado para trabajar metal'),
  (2, 2, 2, '8542.31.00.00', '8542.31.00', 10, 850.000,  920.000,   'Circuitos integrados — procesadores y controladores'),
  (3, 2, 2, '8471.60.00.00', '8471.60.00',  5, 420.000,  455.000,   'Unidades de entrada/salida para computadoras'),
  (4, 3, 4, '0806.10.00.00', '0806.10.00', 800, 18000.000,19500.000, 'Uvas frescas de mesa — variedad Red Globe'),
  (5, 4, 5, '3105.20.00.00', '3105.20.00', 200, 5000.000, 5200.000,  'Fertilizantes minerales o químicos con nitrógeno, fósforo y potasio')
ON CONFLICT DO NOTHING;

-- ── 13. LOGÍSTICA DE TRANSPORTE ───────────────────────────────
INSERT INTO "LogisticasTransporte"
  ("IdTransporte","IdDespacho","EmpresaTransporte","PlacaVehiculo","FechaRetiro","FechaEntrega","EstadoEntrega")
VALUES
  (1, 1, 'Transportes Lima S.A.', 'ABC-123', '2025-02-12 07:00:00', '2025-02-13 16:00:00', 'Entregado'),
  (2, 5, 'Frío Express Perú',     'XYZ-789', '2025-12-01 06:00:00', '2025-12-02 14:30:00', 'Entregado')
ON CONFLICT DO NOTHING;

-- ── 14. RESTRICCIONES DE DESPACHO ─────────────────────────────
INSERT INTO "DespachosRestricciones" ("IdDespacho","IdRestriccion","Estado","FechaAprobacion","Observaciones") VALUES
  (2, 5, 'Verificado',  '2026-05-22 09:00:00', 'Homologación MTC verificada. Número de resolución: 245-2026-MTC.'),
  (4, 1, 'Pendiente',   NULL, 'Pendiente verificar registro sanitario DIGESA para frutas frescas.')
ON CONFLICT DO NOTHING;

-- ── 15. DOCUMENTOS LEGALES (subidos por clientes) ─────────────
-- Empresa 1 (Test Logistics) ya tiene los 3 docs — está activa y contrato firmado
INSERT INTO "Documentos"
  ("IdDocumento","IdEmpresa","IdTipoDoc","IdUsuarioCargador","IdUsuarioValidador","Nombre","RutaArchivo","Estado","FechaCarga")
VALUES
  (1, 1, 1, 2, 1, 'Acta_Constitucion_TestLogistics.pdf',  '/uploads/docs/1/acta_const.pdf',  'Aprobado', '2025-01-12 10:00:00'),
  (2, 1, 2, 2, 1, 'RUC_TestLogistics.pdf',                '/uploads/docs/1/ruc.pdf',         'Aprobado', '2025-01-12 10:05:00'),
  (3, 1, 3, 2, 1, 'DNI_CarlosMendoza.pdf',                '/uploads/docs/1/dni.pdf',         'Aprobado', '2025-01-12 10:10:00'),
-- Empresa 3 (Andina Import) — docs aprobados también
  (4, 3, 1, 4, 1, 'Acta_Constitucion_Andina.pdf',         '/uploads/docs/3/acta_const.pdf',  'Aprobado', '2025-03-16 09:00:00'),
  (5, 3, 2, 4, 1, 'RUC_Andina.pdf',                       '/uploads/docs/3/ruc.pdf',         'Aprobado', '2025-03-16 09:05:00'),
  (6, 3, 3, 4, 1, 'DNI_PedroQuispe.pdf',                  '/uploads/docs/3/dni.pdf',         'Aprobado', '2025-03-16 09:10:00')
ON CONFLICT DO NOTHING;

-- ── 16. DOCUMENTOS LOGÍSTICOS (BL, Facturas, Packing List) ───
INSERT INTO "DocumentosLogisticos"
  ("IdDocumentoLogistico","IdDespacho","TipoDocumento","NombreArchivo","RutaArchivo","TamanoBytes","FechaCarga","IdUsuarioCargador")
VALUES
  (1, 1, 'Conocimiento de Embarque', 'BL_MSC_AURELIA_2025001.pdf',    '/uploads/logisticos/1/bl.pdf',       524288,  '2025-01-22 09:00:00', 1),
  (2, 1, 'Factura Comercial',        'INVOICE_2025001.pdf',            '/uploads/logisticos/1/invoice.pdf',  327680,  '2025-01-22 09:10:00', 1),
  (3, 1, 'Lista de Empaque',         'PACKING_LIST_2025001.pdf',       '/uploads/logisticos/1/packing.pdf',  204800,  '2025-01-22 09:15:00', 1),
  (4, 2, 'Conocimiento de Embarque', 'BL_MAERSK_SENANG_2025002.pdf',   '/uploads/logisticos/2/bl.pdf',       638976,  '2026-05-05 08:30:00', 1),
  (5, 2, 'Factura Comercial',        'INVOICE_SAMSUNG_2025002.pdf',    '/uploads/logisticos/2/invoice.pdf',  409600,  '2026-05-05 08:45:00', 1),
  (6, 4, 'Conocimiento de Embarque', 'BL_SANTA_ELENA_2025004.pdf',     '/uploads/logisticos/4/bl.pdf',       512000,  '2026-05-12 07:30:00', 1),
  (7, 4, 'Certificado de Origen',    'CERT_ORIGEN_CHILE_2025004.pdf',  '/uploads/logisticos/4/cert_ori.pdf', 256000,  '2026-05-12 07:45:00', 1),
  (8, 5, 'Conocimiento de Embarque', 'BL_CMA_CGM_MARCO_2025005.pdf',   '/uploads/logisticos/5/bl.pdf',       491520,  '2025-10-18 09:00:00', 1),
  (9, 5, 'Factura Comercial',        'INVOICE_AGROQUIMICA_2025005.pdf','/uploads/logisticos/5/invoice.pdf',  358400,  '2025-10-18 09:10:00', 1)
ON CONFLICT DO NOTHING;

-- ── 17. ÍTEMS DE FACTURA (Sprint 2) ──────────────────────────
INSERT INTO "ItemsFactura"
  ("IdItem","IdDespacho","Descripcion","Cantidad","Valor","Peso","PartidaArancelaria","TieneRestriccion","FechaModificacion","UsuarioModificacion")
VALUES
  -- Despacho 1: maquinaria CNC
  (1, 1, 'Centro de mecanizado vertical CNC — Haas VF-2SS',     1.000, 38000.00, 10500.000, '8457.10.00.00', FALSE, '2025-01-25 10:00:00', 'admin@test.com'),
  (2, 1, 'Mesa de coordenadas giratoria 4to eje',               2.000,  3500.00,  1200.000, '8466.93.00.00', FALSE, '2025-01-25 10:05:00', 'admin@test.com'),
  (3, 1, 'Kit herramientas de corte HSS — juego de 50 piezas',  3.000,  1250.00,   450.000, '8207.19.00.00', FALSE, '2025-01-25 10:10:00', 'admin@test.com'),
  -- Despacho 2: componentes electrónicos
  (4, 2, 'Microcontrolador STM32F4 — 200 unidades',           200.000,    8.50,     3.200, '8542.31.00.00', TRUE,  '2026-05-06 09:00:00', 'admin@test.com'),
  (5, 2, 'Módulo WiFi ESP32-WROOM-32 — 500 unidades',         500.000,    4.20,     1.800, '8542.31.00.00', TRUE,  '2026-05-06 09:05:00', 'admin@test.com'),
  (6, 2, 'Pantalla LCD TFT 7 pulgadas IPS — 50 unidades',      50.000,   45.00,    12.000, '8471.60.00.00', FALSE, '2026-05-06 09:10:00', 'admin@test.com'),
  -- Despacho 4: frutas
  (7, 4, 'Uvas de mesa Red Globe — 18 Tm',                      18.000, 666.67, 18000.000, '0806.10.00.00', TRUE,  '2026-05-13 08:00:00', 'admin@test.com'),
  -- Despacho 5: fertilizantes
  (8, 5, 'Fertilizante NPK 15-15-15 en sacos 50kg — 100 sacos',100.000, 185.00,  5000.000, '3105.20.00.00', FALSE, '2025-10-20 10:00:00', 'admin@test.com')
ON CONFLICT DO NOTHING;

-- ── 18. COMPROBANTES DE PAGO ──────────────────────────────────
INSERT INTO "ComprobantesPago"
  ("IdComprobante","IdDespacho","RutaArchivo","Formato","Estado","FechaSubida","FechaValidacion","IdUsuarioValidador")
VALUES
  (1, 1, '/uploads/pagos/1/comprobante_dam.pdf',   'pdf', 'Aprobado',  '2025-02-06 09:00:00', '2025-02-07 10:00:00', 1),
  (2, 5, '/uploads/pagos/5/comprobante_dam.pdf',   'pdf', 'Aprobado',  '2025-10-22 08:00:00', '2025-10-23 09:00:00', 1),
  (3, 2, '/uploads/pagos/2/comprobante_dep.pdf',   'pdf', 'Pendiente', '2026-05-24 11:00:00', NULL,                  NULL)
ON CONFLICT DO NOTHING;

-- ── 19. AUDITORÍA (muestra de eventos de sistema) ─────────────
INSERT INTO "Auditorias"
  ("IdAuditoria","IdUsuario","TablaAfectada","Accion","Ip","FechaHora","Detalle")
VALUES
  (1, 1, 'Despachos',          'INSERT', '192.168.1.10', '2025-01-20 08:00:00', 'Creación de despacho BL2025001'),
  (2, 1, 'Dams',               'INSERT', '192.168.1.10', '2025-01-22 10:00:00', 'Creación de DAM para despacho BL2025001'),
  (3, 2, 'ContratosServicio',  'UPDATE', '192.168.1.55', '2025-01-15 14:30:00', 'Firma digital de contrato por cliente Carlos Mendoza'),
  (4, 1, 'Despachos',          'INSERT', '192.168.1.10', '2026-05-01 10:30:00', 'Creación de despacho BL2025002'),
  (5, 1, 'EtapasDespacho',     'UPDATE', '192.168.1.10', '2026-05-25 11:00:00', 'Cambio de etapa Desaduanización a En proceso — despacho BL2025002')
ON CONFLICT DO NOTHING;

-- ── 20. RESETEAR SECUENCIAS (necesario si se insertan IDs explícitos) ──
-- Ejecutar SOLO si después vas a crear registros desde la app sin especificar ID
SELECT setval(pg_get_serial_sequence('"Roles"',              '"IdRol"'),              (SELECT MAX("IdRol")              FROM "Roles"),              TRUE);
SELECT setval(pg_get_serial_sequence('"Empresas"',           '"IdEmpresa"'),          (SELECT MAX("IdEmpresa")          FROM "Empresas"),           TRUE);
SELECT setval(pg_get_serial_sequence('"Usuarios"',           '"IdUsuario"'),          (SELECT MAX("IdUsuario")          FROM "Usuarios"),           TRUE);
SELECT setval(pg_get_serial_sequence('"ContratosServicio"',  '"IdContrato"'),         (SELECT MAX("IdContrato")         FROM "ContratosServicio"),  TRUE);
SELECT setval(pg_get_serial_sequence('"CanalesSunat"',       '"IdCanal"'),            (SELECT MAX("IdCanal")            FROM "CanalesSunat"),       TRUE);
SELECT setval(pg_get_serial_sequence('"Despachos"',          '"IdDespacho"'),         (SELECT MAX("IdDespacho")         FROM "Despachos"),          TRUE);
SELECT setval(pg_get_serial_sequence('"TiposEtapa"',         '"IdTipoEtapa"'),        (SELECT MAX("IdTipoEtapa")        FROM "TiposEtapa"),         TRUE);
SELECT setval(pg_get_serial_sequence('"EtapasDespacho"',     '"IdEtapa"'),            (SELECT MAX("IdEtapa")            FROM "EtapasDespacho"),     TRUE);
SELECT setval(pg_get_serial_sequence('"Dams"',               '"IdDam"'),              (SELECT MAX("IdDam")              FROM "Dams"),               TRUE);
SELECT setval(pg_get_serial_sequence('"PartidasArancelarias"','"IdPartida"'),         (SELECT MAX("IdPartida")          FROM "PartidasArancelarias"),TRUE);
SELECT setval(pg_get_serial_sequence('"RestriccionesLegales"','"IdRestriccion"'),     (SELECT MAX("IdRestriccion")      FROM "RestriccionesLegales"),TRUE);
SELECT setval(pg_get_serial_sequence('"TiposDocumento"',     '"IdTipoDoc"'),          (SELECT MAX("IdTipoDoc")          FROM "TiposDocumento"),     TRUE);
SELECT setval(pg_get_serial_sequence('"Documentos"',         '"IdDocumento"'),        (SELECT MAX("IdDocumento")        FROM "Documentos"),         TRUE);
SELECT setval(pg_get_serial_sequence('"DocumentosLogisticos"','"IdDocumentoLogistico"'),(SELECT MAX("IdDocumentoLogistico") FROM "DocumentosLogisticos"),TRUE);
SELECT setval(pg_get_serial_sequence('"ItemsFactura"',       '"IdItem"'),             (SELECT MAX("IdItem")             FROM "ItemsFactura"),       TRUE);
SELECT setval(pg_get_serial_sequence('"ComprobantesPago"',   '"IdComprobante"'),      (SELECT MAX("IdComprobante")      FROM "ComprobantesPago"),   TRUE);
SELECT setval(pg_get_serial_sequence('"LogisticasTransporte"','"IdTransporte"'),      (SELECT MAX("IdTransporte")       FROM "LogisticasTransporte"),TRUE);
SELECT setval(pg_get_serial_sequence('"Auditorias"',         '"IdAuditoria"'),        (SELECT MAX("IdAuditoria")        FROM "Auditorias"),         TRUE);

-- ── VERIFICACIÓN RÁPIDA ───────────────────────────────────────
SELECT 'Roles'               AS tabla, COUNT(*) AS registros FROM "Roles"
UNION ALL SELECT 'Empresas',              COUNT(*) FROM "Empresas"
UNION ALL SELECT 'Usuarios',              COUNT(*) FROM "Usuarios"
UNION ALL SELECT 'Contratos',             COUNT(*) FROM "ContratosServicio"
UNION ALL SELECT 'Canales SUNAT',         COUNT(*) FROM "CanalesSunat"
UNION ALL SELECT 'Despachos',             COUNT(*) FROM "Despachos"
UNION ALL SELECT 'Tipos Etapa',           COUNT(*) FROM "TiposEtapa"
UNION ALL SELECT 'Etapas Despacho',       COUNT(*) FROM "EtapasDespacho"
UNION ALL SELECT 'DAMs',                  COUNT(*) FROM "Dams"
UNION ALL SELECT 'Partidas Arancelarias', COUNT(*) FROM "PartidasArancelarias"
UNION ALL SELECT 'Docs Logísticos',       COUNT(*) FROM "DocumentosLogisticos"
UNION ALL SELECT 'Items Factura',         COUNT(*) FROM "ItemsFactura"
UNION ALL SELECT 'Documentos Legales',    COUNT(*) FROM "Documentos"
UNION ALL SELECT 'Comprobantes Pago',     COUNT(*) FROM "ComprobantesPago";
