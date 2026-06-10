/**
 * PRUEBA DE CAJA BLANCA — HU10: Extraer Datos Factura
 * Fuente: Backend/Controllers/FacturaController.cs
 *
 * Se prueba el endpoint POST /api/Factura/extraer con distintos archivos
 * para ejercer cada rama de validación: sin archivo, formato incorrecto,
 * columnas faltantes, Excel vacío y extracción exitosa.
 *
 * ClosedXML genera archivos .xlsx reales en memoria para la prueba OK.
 */
using ClosedXML.Excel;
using LogisticaBroker.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LogisticaBroker.Tests;

public class HU10_FacturaControllerTests
{
    private static FacturaController BuildController() => new();

    // ── Sin archivo ──────────────────────────────────────────────────────────

    // PA HU10-1.1 NOK — No se seleccionó ningún archivo
    [Fact]
    public async Task ExtraerDatos_SinArchivo_RetornaBadRequest()
    {
        // Fuente: FacturaController.cs:14-15
        var result = await BuildController().ExtraerDatos(null);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("Debe seleccionar un archivo Excel", body);
    }

    // ── Formato incorrecto ────────────────────────────────────────────────────

    // PA HU10-1.2 NOK — Formato de archivo incorrecto
    [Fact]
    public async Task ExtraerDatos_FormatoIncorrecto_RetornaBadRequest()
    {
        // Fuente: FacturaController.cs:17-19
        var pdfBytes = new byte[1024];
        var stream = new MemoryStream(pdfBytes);
        IFormFile archivo = new FormFile(stream, 0, pdfBytes.Length, "archivo", "FacturaComercial.pdf")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/pdf"
        };

        var result = await BuildController().ExtraerDatos(archivo);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("Formato no válido", body);
    }

    // ── Columnas incorrectas ──────────────────────────────────────────────────

    // PA HU10-1.3 NOK — Columnas del Excel no coinciden con las predefinidas
    [Fact]
    public async Task ExtraerDatos_ColumnasIncorrectas_RetornaBadRequest()
    {
        // Fuente: FacturaController.cs:40-46
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Hoja1");
        ws.Cell(1, 1).Value = "Codigo";
        ws.Cell(1, 2).Value = "Nombre";
        ws.Cell(1, 3).Value = "Precio";

        var stream = new MemoryStream();
        wb.SaveAs(stream);
        stream.Position = 0;

        IFormFile archivo = new FormFile(stream, 0, stream.Length, "archivo", "ExcelColumnasMal.xlsx")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        var result = await BuildController().ExtraerDatos(archivo);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("columnas requeridas", body);
    }

    // ── Excel sin filas de datos ──────────────────────────────────────────────

    // PA HU10-1.4 NOK — Archivo Excel sin filas de datos
    [Fact]
    public async Task ExtraerDatos_ExcelVacio_RetornaBadRequest()
    {
        // Fuente: FacturaController.cs:81-82
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Hoja1");
        ws.Cell(1, 1).Value = "Cantidad";
        ws.Cell(1, 2).Value = "Descripción";
        ws.Cell(1, 3).Value = "Valor";
        ws.Cell(1, 4).Value = "Peso";
        // Sin filas de datos

        var stream = new MemoryStream();
        wb.SaveAs(stream);
        stream.Position = 0;

        IFormFile archivo = new FormFile(stream, 0, stream.Length, "archivo", "FacturaVacia.xlsx")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        var result = await BuildController().ExtraerDatos(archivo);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("no contiene ítems para extraer", body);
    }

    // ── Extracción exitosa ────────────────────────────────────────────────────

    // PA HU10-1 OK — Extracción exitosa de datos desde archivo Excel
    [Fact]
    public async Task ExtraerDatos_ExcelValido_RetornaListaItems()
    {
        // Fuente: FacturaController.cs:84
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Hoja1");
        ws.Cell(1, 1).Value = "Cantidad";
        ws.Cell(1, 2).Value = "Descripción";
        ws.Cell(1, 3).Value = "Valor";
        ws.Cell(1, 4).Value = "Peso";
        ws.Cell(2, 1).Value = 10;
        ws.Cell(2, 2).Value = "Electrónica industrial";
        ws.Cell(2, 3).Value = 500.00;
        ws.Cell(2, 4).Value = 25.5;
        ws.Cell(3, 1).Value = 5;
        ws.Cell(3, 2).Value = "Repuestos mecánicos";
        ws.Cell(3, 3).Value = 300.00;
        ws.Cell(3, 4).Value = 10;

        var stream = new MemoryStream();
        wb.SaveAs(stream);
        stream.Position = 0;

        IFormFile archivo = new FormFile(stream, 0, stream.Length, "archivo", "FacturaComercial_MSCU1234567.xlsx")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        var result = await BuildController().ExtraerDatos(archivo);

        var ok = Assert.IsType<OkObjectResult>(result);
        var items = ok.Value as IList<object>;
        Assert.NotNull(items);
        Assert.Equal(2, items!.Count);
    }
}
