/**
 * PRUEBA DE CAJA BLANCA — HU09: Adjuntar Documentos Logísticos
 * Fuente: Backend/Controllers/DocumentosLogisticosController.cs
 *
 * Se prueba el endpoint POST /api/DocumentosLogisticos/{idDespacho}/subir
 * y el endpoint GET /api/DocumentosLogisticos/descargar/{idDocumento}.
 * Se usa InMemory EF para aislar la BD real.
 */
using LogisticaBroker.Controllers;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Tests;

public class HU09_DocumentosLogisticosTests
{
    // ── Helpers ─────────────────────────────────────────────────────────────
    private static AppDbContext BuildContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static async Task<AppDbContext> ContextConDespachoAsync(string dbName, int idDespacho = 1)
    {
        var ctx = BuildContext(dbName);
        ctx.Empresas.Add(new Empresa { IdEmpresa = 1, Ruc = "20100000001", RazonSocial = "Test SAC", Correo = "t@t.com", Estado = "Afiliado Activo" });
        ctx.Despachos.Add(new Despacho { IdDespacho = idDespacho, IdEmpresa = 1, CodigoBl = "MSCU1234567", Estado = "En proceso" });
        ctx.Usuarios.Add(new Usuario { IdUsuario = 1, IdRol = 1, IdEmpresa = 1, Correo = "a@a.com", ContrasenaHash = "x" });
        await ctx.SaveChangesAsync();
        return ctx;
    }

    private static IFormFile MakeFormFile(string fileName, long sizeBytes, string contentType = "application/pdf")
    {
        var content = new byte[sizeBytes];
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, sizeBytes, "Archivo", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    // ── POST /subir ──────────────────────────────────────────────────────────

    // PA HU09-2.3 NOK — Tipo de documento no seleccionado
    [Fact]
    public async Task SubirDocumento_SinTipo_RetornaBadRequest()
    {
        // Fuente: DocumentosLogisticosController.cs:51-52
        using var ctx = await ContextConDespachoAsync("HU09_SinTipo");
        var ctrl = new DocumentosLogisticosController(ctx);

        var req = new SubirDocumentoRequest
        {
            TipoDocumento = "",
            Archivo = MakeFormFile("BL_MSCU1234567.pdf", 1024)
        };

        var result = await ctrl.SubirDocumento(1, req);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("Debe seleccionar el tipo de documento", body);
    }

    // PA HU09-2.1 NOK — Archivo supera el límite de 10 MB
    [Fact]
    public async Task SubirDocumento_Supera10MB_RetornaBadRequest()
    {
        // Fuente: DocumentosLogisticosController.cs:55-56
        using var ctx = await ContextConDespachoAsync("HU09_10MB");
        var ctrl = new DocumentosLogisticosController(ctx);

        var req = new SubirDocumentoRequest
        {
            TipoDocumento = "Bill of Lading",
            Archivo = MakeFormFile("ManifestoCarga.pdf", 14_500_000L)
        };

        var result = await ctrl.SubirDocumento(1, req);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("supera el límite permitido de 10 MB", body);
    }

    // PA HU09-2.2 NOK — Formato de archivo no permitido
    [Fact]
    public async Task SubirDocumento_FormatoNoPermitido_RetornaBadRequest()
    {
        // Fuente: DocumentosLogisticosController.cs:58-61
        using var ctx = await ContextConDespachoAsync("HU09_Formato");
        var ctrl = new DocumentosLogisticosController(ctx);

        var req = new SubirDocumentoRequest
        {
            TipoDocumento = "Otros",
            Archivo = MakeFormFile("reporte.exe", 1024, "application/octet-stream")
        };

        var result = await ctrl.SubirDocumento(1, req);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("Formato no admitido", body);
    }

    // PA HU09-2 OK — Carga exitosa de documento logístico
    [Fact]
    public async Task SubirDocumento_ArchivoValido_RetornaOkYGuardaEnBD()
    {
        // Fuente: DocumentosLogisticosController.cs:84-93
        using var ctx = await ContextConDespachoAsync("HU09_OK");
        var ctrl = new DocumentosLogisticosController(ctx);

        var req = new SubirDocumentoRequest
        {
            TipoDocumento = "Bill of Lading",
            Archivo = MakeFormFile("BL_MSCU1234567.pdf", 3_200_000L)
        };

        var result = await ctrl.SubirDocumento(1, req);

        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(1, await ctx.DocumentosLogisticos.CountAsync());
    }

    // ── GET /descargar ────────────────────────────────────────────────────────

    // PA HU09-3.2 NOK — Archivo ya no disponible en el servidor (404)
    [Fact]
    public async Task DescargarDocumento_NoExiste_RetornaNotFound()
    {
        // Fuente: DocumentosLogisticosController.cs:101-102
        using var ctx = BuildContext("HU09_NoDoc");
        var ctrl = new DocumentosLogisticosController(ctx);

        var result = await ctrl.DescargarDocumento(999);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        var body = notFound.Value!.ToString();
        Assert.Contains("no está disponible", body);
    }

    // PA HU09-3 OK — Descarga exitosa de documento logístico
    [Fact]
    public async Task DescargarDocumento_Existe_RetornaOkConRuta()
    {
        // Fuente: DocumentosLogisticosController.cs:104-111
        using var ctx = BuildContext("HU09_DescOK");
        ctx.Empresas.Add(new Empresa { IdEmpresa = 1, Ruc = "20100000001", RazonSocial = "Test SAC", Correo = "t@t.com", Estado = "Afiliado Activo" });
        ctx.Despachos.Add(new Despacho { IdDespacho = 1, IdEmpresa = 1, CodigoBl = "MSCU1234567", Estado = "En proceso" });
        ctx.Usuarios.Add(new Usuario { IdUsuario = 1, IdRol = 1, IdEmpresa = 1, Correo = "a@a.com", ContrasenaHash = "x" });
        ctx.DocumentosLogisticos.Add(new DocumentoLogistico
        {
            IdDocumentoLogistico = 1,
            IdDespacho = 1,
            TipoDocumento = "Bill of Lading",
            NombreArchivo = "BL_MSCU1234567.pdf",
            RutaArchivo = "https://storage.logisticabroker.com/despachos/1/archivo.pdf",
            TamanoBytes = 3_200_000L,
            IdUsuarioCargador = 1
        });
        await ctx.SaveChangesAsync();

        var ctrl = new DocumentosLogisticosController(ctx);
        var result = await ctrl.DescargarDocumento(1);

        Assert.IsType<OkObjectResult>(result);
    }
}
