-- Insertar una empresa de prueba si no existe
INSERT INTO "Empresas" ("IdEmpresa", "CodigoOrden", "Ruc", "RazonSocial", "NombreContacto", "Correo", "Celular", "Direccion", "Rubro", "MontoItem", "Estado", "FechaRegistro")
VALUES (1, 'ORD-001', '20123456789', 'Empresa Test SAC', 'Juan Perez', 'juan@test.com', '987654321', 'Av. Test 123', 'Importación', 1000.00, 'Pendiente', '2024-01-01')
ON CONFLICT ("IdEmpresa") DO NOTHING;

-- Insertar un contrato de prueba
INSERT INTO "ContratosServicio" ("IdContrato", "IdEmpresa", "Titulo", "Version", "EstadoFirma", "UrlDocumento", "TokenFirma", "EdicionBloqueada", "FechaGeneracion", "FechaFirma")
VALUES (1, 1, 'Contrato de Servicios Logísticos', '1.0', 'Pendiente', NULL, NULL, false, '2024-01-15', NULL);
