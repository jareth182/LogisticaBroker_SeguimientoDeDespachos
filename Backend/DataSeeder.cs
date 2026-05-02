using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Data;

public class DataSeeder
{
    public static async Task SeedData(AppDbContext context)
    {
        // 1. Rol de administrador
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.Add(new Rol { IdRol = 1, NombreRol = "Administrador", Descripcion = "Usuario con acceso completo al sistema" });
            await context.SaveChangesAsync();
        }

        // 2. Empresa de prueba
        var empresa = await context.Empresas.FirstOrDefaultAsync(e => e.Correo == "juan@test.com");
        if (empresa == null)
        {
            empresa = new Empresa
            {
                CodigoOrden = "ORD-001",
                Ruc = "20123456789",
                RazonSocial = "Empresa Test SAC",
                NombreContacto = "Juan Perez",
                Correo = "juan@test.com",
                Celular = "987654321",
                Direccion = "Av. Test 123",
                Rubro = "Importación",
                MontoItem = 1000.00m,
                Estado = "Pendiente",
                FechaRegistro = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            context.Empresas.Add(empresa);
            await context.SaveChangesAsync();
        }

        // 3. Usuario admin
        if (!await context.Usuarios.AnyAsync(u => u.Correo == "admin@test.com"))
        {
            context.Usuarios.Add(new Usuario
            {
                NombreCompleto = "Administrador del Sistema",
                Correo = "admin@test.com",
                ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                IdEmpresa = empresa.IdEmpresa,
                IdRol = 1,
                Estado = "Activo"
            });
            await context.SaveChangesAsync();
        }

        // 4. Tipos de etapas para tracking
        if (!await context.TiposEtapa.AnyAsync())
        {
            context.TiposEtapa.AddRange(new[]
            {
                new TipoEtapa { IdTipoEtapa = 1, Nombre = "Documentación Recibida", Descripcion = "Recepción de documentos del cliente", Orden = 1 },
                new TipoEtapa { IdTipoEtapa = 2, Nombre = "Revisión Documental", Descripcion = "Verificación de documentos", Orden = 2 },
                new TipoEtapa { IdTipoEtapa = 3, Nombre = "Despacho Aduanero", Descripcion = "Presentación en aduanas", Orden = 3 },
                new TipoEtapa { IdTipoEtapa = 4, Nombre = "Aforo Físico", Descripcion = "Inspección de mercancía", Orden = 4 },
                new TipoEtapa { IdTipoEtapa = 5, Nombre = "Liberación", Descripcion = "Autorización de salida", Orden = 5 },
                new TipoEtapa { IdTipoEtapa = 6, Nombre = "Entrega Final", Descripcion = "Entrega al cliente", Orden = 6 }
            });
            await context.SaveChangesAsync();
        }

        // 5. Despachos de prueba para tracking
        if (!await context.Despachos.AnyAsync())
        {
            context.Despachos.AddRange(new[]
            {
                new Despacho
                {
                    IdEmpresa = empresa.IdEmpresa,
                    CodigoBl = "BL2024001",
                    CodigoOrden = "ORD-001",
                    Nave = "MSC MARCO POLO",
                    Contenedor = "MSKU1234567",
                    Origen = "Shanghai, China",
                    Destino = "Callao, Perú",
                    Eta = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)),
                    Mercancia = "Electrónicos",
                    PorcentajeProgreso = 60,
                    Estado = "En proceso",
                    FechaCreacion = DateTime.UtcNow
                },
                new Despacho
                {
                    IdEmpresa = empresa.IdEmpresa,
                    CodigoBl = "BL2024002",
                    CodigoOrden = "ORD-002",
                    Nave = "COSCO SHIPPING",
                    Contenedor = "COSU9876543",
                    Origen = "Busan, Corea",
                    Destino = "Callao, Perú",
                    Eta = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)),
                    Mercancia = "Textiles",
                    PorcentajeProgreso = 30,
                    Estado = "En proceso",
                    FechaCreacion = DateTime.UtcNow
                },
                new Despacho
                {
                    IdEmpresa = empresa.IdEmpresa,
                    CodigoBl = "BL2024003",
                    CodigoOrden = "ORD-003",
                    Nave = "HAPAG LLOYD",
                    Contenedor = "HLU4567890",
                    Origen = "Los Angeles, USA",
                    Destino = "Callao, Perú",
                    Eta = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
                    Mercancia = "Maquinaria",
                    PorcentajeProgreso = 90,
                    Estado = "En proceso",
                    FechaCreacion = DateTime.UtcNow
                }
            });
            await context.SaveChangesAsync();
        }

        // 6. Etapas de despacho para tracking
        if (!await context.EtapasDespacho.AnyAsync())
        {
            var despachos = await context.Despachos.OrderBy(d => d.IdDespacho).Take(3).ToListAsync();
            var tiposEtapa = await context.TiposEtapa.OrderBy(t => t.Orden).ToListAsync();

            if (despachos.Count >= 3 && tiposEtapa.Count >= 6)
            {
                var etapas = new List<EtapaDespacho>();

                // Despacho 1 - 60% (3 completadas, 1 en proceso, 2 pendientes)
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[0].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-4) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[1].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-3) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[2].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[3].IdTipoEtapa, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[4].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[0].IdDespacho, IdTipoEtapa = tiposEtapa[5].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });

                // Despacho 2 - 30% (1 completada, 1 en proceso, 4 pendientes)
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[0].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[1].IdTipoEtapa, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[2].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[3].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[4].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[1].IdDespacho, IdTipoEtapa = tiposEtapa[5].IdTipoEtapa, Estado = "Pendiente", FechaHora = DateTime.UtcNow });

                // Despacho 3 - 90% (5 completadas, 1 en proceso)
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[0].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-6) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[1].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-5) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[2].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-4) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[3].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-3) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[4].IdTipoEtapa, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) });
                etapas.Add(new EtapaDespacho { IdDespacho = despachos[2].IdDespacho, IdTipoEtapa = tiposEtapa[5].IdTipoEtapa, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) });

                context.EtapasDespacho.AddRange(etapas);
                await context.SaveChangesAsync();
            }
        }

        // 6b. Asegurar que despachos sin etapas las tengan
        var despachosSinEtapas = await context.Despachos
            .Where(d => !context.EtapasDespacho.Any(e => e.IdDespacho == d.IdDespacho))
            .ToListAsync();
        if (despachosSinEtapas.Any())
        {
            var tiposEtapaAll = await context.TiposEtapa.OrderBy(t => t.Orden).ToListAsync();
            foreach (var despacho in despachosSinEtapas)
            {
                foreach (var tipo in tiposEtapaAll)
                {
                    context.EtapasDespacho.Add(new EtapaDespacho
                    {
                        IdDespacho = despacho.IdDespacho,
                        IdTipoEtapa = tipo.IdTipoEtapa,
                        Estado = tipo.Orden == 1 ? "En Proceso" : "Pendiente",
                        FechaHora = DateTime.UtcNow
                    });
                }
                // Actualizar estado si era Borrador
                if (despacho.Estado == "Borrador")
                {
                    despacho.Estado = "En proceso";
                }
            }
            await context.SaveChangesAsync();
        }

        // 7. Contrato de prueba
        if (!await context.ContratosServicio.AnyAsync())
        {
            context.ContratosServicio.Add(new ContratoServicio
            {
                IdEmpresa = empresa.IdEmpresa,
                Titulo = "Contrato de Servicios Logísticos",
                Version = "1.0",
                EstadoFirma = "Pendiente",
                EdicionBloqueada = false,
                FechaGeneracion = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        }

        // Mostrar credenciales
        Console.WriteLine("=== CREDENCIALES DE PRUEBA ===");
        Console.WriteLine("Correo: admin@test.com");
        Console.WriteLine("Contraseña: admin123");
        Console.WriteLine("=============================");
    }
}
