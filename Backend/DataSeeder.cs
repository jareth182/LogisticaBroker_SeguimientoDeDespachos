using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Data;

public class DataSeeder
{
    public static async Task SeedData(AppDbContext context)
    {
        // Verificar si ya hay datos
        if (await context.ContratosServicio.AnyAsync())
        {
            return; // Ya hay datos, no hacer nada
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

        // Crear contrato de prueba
        var contrato = new ContratoServicio
        {
            IdContrato = 1,
            IdEmpresa = 1,
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
        
        await context.SaveChangesAsync();
    }
}
