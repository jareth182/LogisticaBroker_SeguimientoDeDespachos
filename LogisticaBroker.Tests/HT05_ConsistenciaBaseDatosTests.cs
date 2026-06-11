/**
 * PRUEBA DE CONSISTENCIA — HT05: Realizar Pruebas de Consistencia de Base de Datos
 * Fuente: Backend/Data/AppDbContext.cs, Backend/Services/EmpresaService.cs
 *
 * Procedimiento HT05:
 *   1. Inserción y modificación de datos en tablas core (Clientes, Despachos, Documentos).
 *   2. Integridad referencial: FK con OnDelete=Restrict evitan registros huérfanos;
 *      FK con OnDelete=Cascade eliminan hijos al borrar el padre.
 *   3. Unicidad: RUC, Correo y CodigoBl duplicados son rechazados por la BD/aplicación.
 *
 * Detalles técnicos:
 *   - Entorno aislado: EF Core InMemory (sin impacto en el esquema de producción).
 *   - Las excepciones de BD son capturadas en la capa de servicio y el frontend
 *     recibe únicamente mensajes amigables (sin sentencias SQL expuestas).
 */
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace LogisticaBroker.Tests;

public class HT05_ConsistenciaBaseDatosTests
{
    // ── Helpers ─────────────────────────────────────────────────────────────

    private static AppDbContext BuildContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static EmailService BuildEmailServiceMock()
    {
        // EmailService con SMTP apuntando a localhost; falla silenciosamente
        // porque EmpresaService envuelve el envío en catch { }.
        var cfg = new Mock<IConfiguration>();
        cfg.Setup(c => c["EmailSettings:SmtpServer"]).Returns("localhost");
        cfg.Setup(c => c["EmailSettings:Port"]).Returns("25");
        cfg.Setup(c => c["EmailSettings:SenderEmail"]).Returns("no-reply@test.com");
        cfg.Setup(c => c["EmailSettings:Password"]).Returns("x");
        cfg.Setup(c => c["EmailSettings:SenderName"]).Returns("Test");
        return new EmailService(cfg.Object);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GRUPO 1 — Inserción y modificación de datos en tablas core
    // ─────────────────────────────────────────────────────────────────────────

    // HT05-1.1 OK — Insertar cliente con datos completos; estado inicial = "Pendiente"
    [Fact]
    public async Task InsertarCliente_DatosValidos_SeGuardaConEstadoPendiente()
    {
        // Fuente: AppDbContext.cs — configuración Empresa, Estado HasDefaultValue("Pendiente")
        using var ctx = BuildContext("HT05_InsertarCliente");

        var empresa = new Empresa
        {
            Ruc            = "20100000001",
            RazonSocial    = "Importaciones Test S.A.C.",
            NombreContacto = "Juan Pérez",
            Correo         = "contacto@importtest.com",
            Estado         = "Pendiente"
        };
        ctx.Empresas.Add(empresa);
        await ctx.SaveChangesAsync();

        var guardada = await ctx.Empresas.FirstAsync(e => e.Ruc == "20100000001");
        Assert.Equal("Importaciones Test S.A.C.", guardada.RazonSocial);
        Assert.Equal("Juan Pérez", guardada.NombreContacto);
        Assert.Equal("Pendiente", guardada.Estado);
    }

    // HT05-1.2 OK — Modificar el estado de un cliente existente de Pendiente a Activo
    [Fact]
    public async Task ModificarEstadoCliente_DePendienteAActivo_SeActualizaCorrectamente()
    {
        // Fuente: AppDbContext.cs — Empresa.Estado HasMaxLength(30)
        using var ctx = BuildContext("HT05_ModificarEstado");

        var empresa = new Empresa
        {
            Ruc            = "20100000002",
            RazonSocial    = "Empresa Modificable S.A.C.",
            NombreContacto = "Ana López",
            Correo         = "ana@modificable.com",
            Estado         = "Pendiente"
        };
        ctx.Empresas.Add(empresa);
        await ctx.SaveChangesAsync();

        empresa.Estado = "Activo";
        await ctx.SaveChangesAsync();

        var actualizada = await ctx.Empresas.FindAsync(empresa.IdEmpresa);
        Assert.Equal("Activo", actualizada!.Estado);
    }

    // HT05-1.3 OK — Insertar despacho vinculado a una empresa existente
    [Fact]
    public async Task InsertarDespacho_EmpresaExistente_SeGuardaConEstadoAperturado()
    {
        // Fuente: AppDbContext.cs — Despacho FK a Empresa; Estado HasDefaultValue("En proceso")
        using var ctx = BuildContext("HT05_InsertarDespacho");

        ctx.Empresas.Add(new Empresa
        {
            IdEmpresa = 1, Ruc = "20100000003",
            RazonSocial = "Importadora Marítima S.A.C.",
            NombreContacto = "Pedro Ríos",
            Correo = "pedro@maritima.com", Estado = "Activo"
        });
        await ctx.SaveChangesAsync();

        var despacho = new Despacho
        {
            IdEmpresa = 1,
            CodigoBl  = "MSCU9876543",
            Estado    = "Aperturado"
        };
        ctx.Despachos.Add(despacho);
        await ctx.SaveChangesAsync();

        var guardado = await ctx.Despachos.FirstAsync(d => d.CodigoBl == "MSCU9876543");
        Assert.Equal(1, guardado.IdEmpresa);
        Assert.Equal("Aperturado", guardado.Estado);
    }

    // HT05-1.4 OK — Insertar documento logístico vinculado a un despacho existente
    [Fact]
    public async Task InsertarDocumentoLogistico_DespachoExistente_SeGuardaConTipoYNombre()
    {
        // Fuente: AppDbContext.cs — DocumentoLogistico FK a Despacho
        using var ctx = BuildContext("HT05_InsertarDocumento");

        ctx.Empresas.Add(new Empresa
        {
            IdEmpresa = 1, Ruc = "20100000004",
            RazonSocial = "Empresa Docs S.A.C.",
            NombreContacto = "Laura Vega",
            Correo = "laura@docs.com", Estado = "Activo"
        });
        ctx.Despachos.Add(new Despacho
        {
            IdDespacho = 1, IdEmpresa = 1,
            CodigoBl   = "CSAV1234567", Estado = "Aperturado"
        });
        await ctx.SaveChangesAsync();

        ctx.DocumentosLogisticos.Add(new DocumentoLogistico
        {
            IdDespacho    = 1,
            TipoDocumento = "BL Original",
            NombreArchivo = "bl_original.pdf",
            RutaArchivo   = "/docs/bl_original.pdf"
        });
        await ctx.SaveChangesAsync();

        var doc = await ctx.DocumentosLogisticos.FirstAsync(d => d.TipoDocumento == "BL Original");
        Assert.Equal(1, doc.IdDespacho);
        Assert.Equal("bl_original.pdf", doc.NombreArchivo);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GRUPO 2 — Integridad Referencial (Foreign Keys)
    //
    // Las pruebas de metadatos verifican que el modelo EF Core está configurado
    // con las restricciones correctas, garantizando que PostgreSQL las aplique
    // en el entorno de producción.
    // ─────────────────────────────────────────────────────────────────────────

    // HT05-2.1 OK — FK Despacho→Empresa tiene OnDelete=Restrict (evita huérfanos)
    [Fact]
    public void ModeloDespacho_FKEmpresa_TieneOnDeleteRestrict()
    {
        // Fuente: AppDbContext.cs:118-121
        // Garantiza que la BD bloquea la eliminación de una Empresa con Despachos activos.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_FKDespacho").Options;
        using var ctx = new AppDbContext(options);

        var fk = ctx.Model
            .FindEntityType(typeof(Despacho))!
            .GetForeignKeys()
            .First(fk => fk.PrincipalEntityType.ClrType == typeof(Empresa));

        Assert.Equal(DeleteBehavior.Restrict, fk.DeleteBehavior);
    }

    // HT05-2.2 OK — FK Documento→Empresa tiene OnDelete=Restrict (evita huérfanos)
    [Fact]
    public void ModeloDocumento_FKEmpresa_TieneOnDeleteRestrict()
    {
        // Fuente: AppDbContext.cs:290-293
        // Garantiza que la BD bloquea la eliminación de una Empresa con Documentos vinculados.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_FKDocumento").Options;
        using var ctx = new AppDbContext(options);

        var fk = ctx.Model
            .FindEntityType(typeof(Documento))!
            .GetForeignKeys()
            .First(fk => fk.PrincipalEntityType.ClrType == typeof(Empresa));

        Assert.Equal(DeleteBehavior.Restrict, fk.DeleteBehavior);
    }

    // HT05-2.3 OK — FK EtapaDespacho→Despacho tiene OnDelete=Cascade (sin huérfanos)
    [Fact]
    public void ModeloEtapaDespacho_FKDespacho_TieneOnDeleteCascade()
    {
        // Fuente: AppDbContext.cs:169-172
        // Garantiza que al eliminar un Despacho, sus etapas se eliminan en cascada.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_FKEtapa").Options;
        using var ctx = new AppDbContext(options);

        var fk = ctx.Model
            .FindEntityType(typeof(EtapaDespacho))!
            .GetForeignKeys()
            .First(fk => fk.PrincipalEntityType.ClrType == typeof(Despacho));

        Assert.Equal(DeleteBehavior.Cascade, fk.DeleteBehavior);
    }

    // HT05-2.4 OK — FK DocumentoLogistico→Despacho tiene OnDelete=Cascade (sin huérfanos)
    [Fact]
    public void ModeloDocumentoLogistico_FKDespacho_TieneOnDeleteCascade()
    {
        // Fuente: AppDbContext.cs:355-358
        // Garantiza que eliminar un Despacho elimina en cascada sus documentos logísticos.
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_FKDocLog").Options;
        using var ctx = new AppDbContext(options);

        var fk = ctx.Model
            .FindEntityType(typeof(DocumentoLogistico))!
            .GetForeignKeys()
            .First(fk => fk.PrincipalEntityType.ClrType == typeof(Despacho));

        Assert.Equal(DeleteBehavior.Cascade, fk.DeleteBehavior);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GRUPO 3 — Restricciones de Unicidad (Unique Constraints)
    // ─────────────────────────────────────────────────────────────────────────

    // HT05-3.1 NOK — RUC duplicado es rechazado con mensaje amigable (sin SQL expuesto)
    [Fact]
    public async Task RegistrarEmpresa_RucDuplicado_LanzaExcepcionSinExponerSQL()
    {
        // Fuente: EmpresaService.cs:21-22
        using var ctx = BuildContext("HT05_RucDuplicado");
        ctx.Empresas.Add(new Empresa
        {
            Ruc            = "20100000005",
            RazonSocial    = "Empresa Original S.A.C.",
            NombreContacto = "Roberto Silva",
            Correo         = "roberto@original.com",
            Estado         = "Pendiente"
        });
        await ctx.SaveChangesAsync();

        var service = new EmpresaService(ctx, BuildEmailServiceMock());
        var duplicada = new Empresa
        {
            Ruc            = "20100000005",   // mismo RUC
            RazonSocial    = "Empresa Copia S.A.C.",
            NombreContacto = "Ana García",
            Correo         = "ana@copia.com",
            Estado         = "Pendiente"
        };

        var ex = await Assert.ThrowsAsync<Exception>(
            () => service.RegistrarEmpresaAsync(duplicada));

        // CA2: mensaje amigable, sin exponer sentencias SQL
        Assert.Equal("El RUC ya está registrado", ex.Message);
        Assert.DoesNotContain("SELECT", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("INSERT", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("FROM", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // HT05-3.2 NOK — Correo duplicado es rechazado con mensaje amigable (sin SQL expuesto)
    [Fact]
    public async Task RegistrarEmpresa_CorreoDuplicado_LanzaExcepcionSinExponerSQL()
    {
        // Fuente: EmpresaService.cs:24-25
        using var ctx = BuildContext("HT05_CorreoDuplicado");
        ctx.Empresas.Add(new Empresa
        {
            Ruc            = "20100000006",
            RazonSocial    = "Primera Empresa S.A.C.",
            NombreContacto = "Luis Torres",
            Correo         = "compartido@empresa.com",
            Estado         = "Pendiente"
        });
        await ctx.SaveChangesAsync();

        var service = new EmpresaService(ctx, BuildEmailServiceMock());
        var duplicada = new Empresa
        {
            Ruc            = "20100000007",           // RUC distinto
            RazonSocial    = "Segunda Empresa S.A.C.",
            NombreContacto = "María Flores",
            Correo         = "compartido@empresa.com", // mismo correo
            Estado         = "Pendiente"
        };

        var ex = await Assert.ThrowsAsync<Exception>(
            () => service.RegistrarEmpresaAsync(duplicada));

        // CA2: mensaje amigable, sin exponer sentencias SQL
        Assert.Equal("El correo ya está registrado", ex.Message);
        Assert.DoesNotContain("SELECT", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("INSERT", ex.Message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("FROM", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    // HT05-3.3 OK — CodigoBl tiene índice único definido en el modelo
    [Fact]
    public void ModeloDespacho_CodigoBl_TieneIndiceUnicoConfigurado()
    {
        // Fuente: AppDbContext.cs:109 — HasIndex(x => x.CodigoBl).IsUnique()
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_UniqueCodigoBl").Options;
        using var ctx = new AppDbContext(options);

        var entityType = ctx.Model.FindEntityType(typeof(Despacho))!;
        var indicesUnicos = entityType.GetIndexes().Where(i => i.IsUnique);

        Assert.Contains(indicesUnicos,
            idx => idx.Properties.Any(p => p.Name == nameof(Despacho.CodigoBl)));
    }

    // HT05-3.4 OK — RUC de Empresa tiene índice único definido en el modelo
    [Fact]
    public void ModeloEmpresa_Ruc_TieneIndiceUnicoConfigurado()
    {
        // Fuente: AppDbContext.cs:49 — HasIndex(x => x.Ruc).IsUnique()
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_UniqueRuc").Options;
        using var ctx = new AppDbContext(options);

        var entityType = ctx.Model.FindEntityType(typeof(Empresa))!;
        var indicesUnicos = entityType.GetIndexes().Where(i => i.IsUnique);

        Assert.Contains(indicesUnicos,
            idx => idx.Properties.Any(p => p.Name == nameof(Empresa.Ruc)));
    }

    // HT05-3.5 OK — Correo de Empresa tiene índice único definido en el modelo
    [Fact]
    public void ModeloEmpresa_Correo_TieneIndiceUnicoConfigurado()
    {
        // Fuente: AppDbContext.cs:53 — HasIndex(x => x.Correo).IsUnique()
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("HT05_UniqueCorreo").Options;
        using var ctx = new AppDbContext(options);

        var entityType = ctx.Model.FindEntityType(typeof(Empresa))!;
        var indicesUnicos = entityType.GetIndexes().Where(i => i.IsUnique);

        Assert.Contains(indicesUnicos,
            idx => idx.Properties.Any(p => p.Name == nameof(Empresa.Correo)));
    }
}
