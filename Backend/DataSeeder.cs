using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Data;

public class DataSeeder
{
    public static async Task SeedData(AppDbContext context)
    {
        // Verificar si ya hay usuarios
        if (await context.Usuarios.AnyAsync())
        {
            // Verificar si existe el usuario admin
            var adminUser = await context.Usuarios.FirstOrDefaultAsync(u => u.Correo == "admin@test.com");
            if (adminUser != null)
            {
                Console.WriteLine("=== USUARIOS DE PRUEBA EXISTENTES ===");
                Console.WriteLine("ADMINISTRADOR:");
                Console.WriteLine("  Correo: admin@test.com");
                Console.WriteLine("  Contraseña: admin123");
                Console.WriteLine("=================================");
            }
        }
        else
        {
            // Si no hay usuarios, crearlos
            await CrearUsuariosYEmpresa(context);
        }

        // Crear rol de administrador si no existe
        if (!await context.Roles.AnyAsync())
        {
            var rolAdmin = new Rol
            {
                IdRol = 1,
                NombreRol = "Administrador",
                Descripcion = "Usuario con acceso completo al sistema"
            };
            context.Roles.Add(rolAdmin);
        }

        // Obtener o crear empresa de prueba
        Empresa empresa;
        var existingEmpresa = await context.Empresas.FirstOrDefaultAsync(e => e.Correo == "juan@test.com");
        
        if (existingEmpresa == null)
        {
            empresa = new Empresa
            {
                IdEmpresa = 1,
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
        }
        else
        {
            empresa = existingEmpresa;
        }

        // Crear usuario de prueba con contraseña conocida
        var usuarioTest = new Usuario
        {
            NombreCompleto = "Administrador del Sistema",
            Correo = "admin@test.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1,
            Estado = "Activo"
        };

        context.Usuarios.Add(usuarioTest);

        // Crear usuario para la empresa con contraseña generada
        var passwordEmpresa = Guid.NewGuid().ToString("N")[..8];
        var usuarioEmpresa = new Usuario
        {
            NombreCompleto = "Juan Perez",
            Correo = "juan@test.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(passwordEmpresa),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1,
            Estado = "Activo"
        };

        context.Usuarios.Add(usuarioEmpresa);
        
        await context.SaveChangesAsync();
        
        Console.WriteLine($"Contraseña empresa: {passwordEmpresa}");
    }

    private static async Task CrearUsuariosYEmpresa(AppDbContext context)
    {
        // Crear rol de administrador si no existe
        if (!await context.Roles.AnyAsync())
        {
            var rolAdmin = new Rol
            {
                IdRol = 1,
                NombreRol = "Administrador",
                Descripcion = "Usuario con acceso completo al sistema"
            };
            context.Roles.Add(rolAdmin);
        }

        // Crear empresa de prueba
        var empresa = new Empresa
        {
            IdEmpresa = 1,
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

        // Crear usuario de prueba con contraseña conocida
        var usuarioTest = new Usuario
        {
            NombreCompleto = "Administrador del Sistema",
            Correo = "admin@test.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1,
            Estado = "Activo"
        };

        context.Usuarios.Add(usuarioTest);

        // Crear usuario para la empresa con contraseña generada
        var passwordEmpresa = Guid.NewGuid().ToString("N")[..8];
        var usuarioEmpresa = new Usuario
        {
            NombreCompleto = "Juan Perez",
            Correo = "juan@test.com",
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(passwordEmpresa),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1,
            Estado = "Activo"
        };

        context.Usuarios.Add(usuarioEmpresa);

        // Crear tipos de etapas para tracking
        if (!await context.TiposEtapa.AnyAsync())
        {
            var tiposEtapas = new[]
            {
                new TipoEtapa { IdTipoEtapa = 1, Nombre = "Documentación Recibida", Descripcion = "Recepción de documentos del cliente", Orden = 1 },
                new TipoEtapa { IdTipoEtapa = 2, Nombre = "Revisión Documental", Descripcion = "Verificación de documentos", Orden = 2 },
                new TipoEtapa { IdTipoEtapa = 3, Nombre = "Despacho Aduanero", Descripcion = "Presentación en aduanas", Orden = 3 },
                new TipoEtapa { IdTipoEtapa = 4, Nombre = "Aforo Físico", Descripcion = "Inspección de mercancía", Orden = 4 },
                new TipoEtapa { IdTipoEtapa = 5, Nombre = "Liberación", Descripcion = "Autorización de salida", Orden = 5 },
                new TipoEtapa { IdTipoEtapa = 6, Nombre = "Entrega Final", Descripcion = "Entrega al cliente", Orden = 6 }
            };
            context.TiposEtapa.AddRange(tiposEtapas);
        }

        // Crear despachos de prueba para tracking
        if (!await context.Despachos.AnyAsync())
        {
            var despachos = new[]
            {
                new Despacho
                {
                    IdDespacho = 1,
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
                    FechaCreacion = DateTime.UtcNow.AddDays(-5)
                },
                new Despacho
                {
                    IdDespacho = 2,
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
                    FechaCreacion = DateTime.UtcNow.AddDays(-3)
                },
                new Despacho
                {
                    IdDespacho = 3,
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
                    FechaCreacion = DateTime.UtcNow.AddDays(-7)
                }
            };
            context.Despachos.AddRange(despachos);
        }

        // Crear etapas de despacho para tracking
        if (!await context.EtapasDespacho.AnyAsync())
        {
            var etapasDespacho = new List<EtapaDespacho>();
            
            // Despacho 1 - 60% completado (3 de 5 etapas)
            etapasDespacho.AddRange(new[]
            {
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 1, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-4) },
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 2, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-3) },
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 3, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) },
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 4, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) },
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 5, Estado = "Pendiente", FechaHora = DateTime.UtcNow },
                new EtapaDespacho { IdDespacho = 1, IdTipoEtapa = 6, Estado = "Pendiente", FechaHora = DateTime.UtcNow }
            });
            
            // Despacho 2 - 30% completado (1 de 5 etapas)
            etapasDespacho.AddRange(new[]
            {
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 1, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) },
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 2, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) },
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 3, Estado = "Pendiente", FechaHora = DateTime.UtcNow },
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 4, Estado = "Pendiente", FechaHora = DateTime.UtcNow },
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 5, Estado = "Pendiente", FechaHora = DateTime.UtcNow },
                new EtapaDespacho { IdDespacho = 2, IdTipoEtapa = 6, Estado = "Pendiente", FechaHora = DateTime.UtcNow }
            });
            
            // Despacho 3 - 90% completado (5 de 6 etapas)
            etapasDespacho.AddRange(new[]
            {
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 1, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-6) },
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 2, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-5) },
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 3, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-4) },
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 4, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-3) },
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 5, Estado = "Completado", FechaHora = DateTime.UtcNow.AddDays(-2) },
                new EtapaDespacho { IdDespacho = 3, IdTipoEtapa = 6, Estado = "En Proceso", FechaHora = DateTime.UtcNow.AddDays(-1) }
            });
            
            context.EtapasDespacho.AddRange(etapasDespacho);
        }

        // Crear contrato de prueba si no existe
        if (!await context.ContratosServicio.AnyAsync())
        {
            var contrato = new ContratoServicio
            {
                IdContrato = 1,
                IdEmpresa = empresa.IdEmpresa,
                Titulo = "Contrato de Servicios Logísticos",
                Version = "1.0",
                EstadoFirma = "Pendiente",
                UrlDocumento = null,
                TokenFirma = null,
                EdicionBloqueada = false,
                FechaGeneracion = DateTime.UtcNow,
                FechaFirma = null
            };
            context.ContratosServicio.Add(contrato);
        }
        
        await context.SaveChangesAsync();

        // Mostrar credenciales en consola para desarrollo
        Console.WriteLine("=== USUARIOS DE PRUEBA CREADOS ===");
        Console.WriteLine("ADMINISTRADOR:");
        Console.WriteLine("  Correo: admin@test.com");
        Console.WriteLine("  Contraseña: admin123");
        Console.WriteLine("EMPRESA:");
        Console.WriteLine("  Correo: juan@test.com");
        Console.WriteLine($"  Contraseña: {passwordEmpresa}");
        Console.WriteLine("=================================");
    }
}
