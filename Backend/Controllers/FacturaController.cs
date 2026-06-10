using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;

namespace LogisticaBroker.Controllers;

public class ExtraerDatosRequest
{
    public IFormFile? Archivo { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class FacturaController : ControllerBase
{
    // POST /api/Factura/extraer
    [HttpPost("extraer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ExtraerDatos([FromForm] ExtraerDatosRequest request)
    {
        var archivo = request.Archivo;
        if (archivo is null || archivo.Length == 0) // PA HU10-1.1 NOK — no se seleccionó ningún archivo
            return BadRequest(new { mensaje = "Debe seleccionar un archivo Excel antes de continuar." });

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        if (extension != ".xlsx" && extension != ".xls") // PA HU10-1.2 NOK — formato de archivo incorrecto (PDF, etc.)
            return BadRequest(new { mensaje = "Formato no válido. Solo se admiten archivos Excel (.xlsx o .xls) para la extracción de datos." });

        try
        {
            using var stream = new MemoryStream();
            await archivo.CopyToAsync(stream);
            stream.Position = 0;

            using var workbook = new XLWorkbook(stream);
            var hoja = workbook.Worksheets.First();

            // Buscar cabeceras (fila 1)
            var cabeceras = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            var filaHeader = hoja.Row(1);
            for (int col = 1; col <= hoja.LastColumnUsed()?.ColumnNumber() || col <= 20; col++)
            {
                var celda = filaHeader.Cell(col).GetString().Trim();
                if (string.IsNullOrEmpty(celda)) break;
                cabeceras[celda] = col;
            }

            var requeridas = new[] { "Cantidad", "Descripción", "Valor", "Peso" };
            var faltantes = requeridas.Where(r =>
                !cabeceras.ContainsKey(r) &&
                !cabeceras.ContainsKey(r.Replace("ó", "o"))).ToArray();

            if (faltantes.Length > 0) // PA HU10-1.3 NOK — columnas del Excel no coinciden con las requeridas
                return BadRequest(new { mensaje = $"El archivo no contiene las columnas requeridas: Cantidad, Descripción, Valor, Peso. Verifique el formato del archivo." });

            // Resolver columnas con o sin tilde
            int ColIdx(string nombre) =>
                cabeceras.TryGetValue(nombre, out var idx) ? idx :
                cabeceras.TryGetValue(nombre.Replace("ó", "o"), out var idx2) ? idx2 : -1;

            var colCantidad    = ColIdx("Cantidad");
            var colDescripcion = ColIdx("Descripción");
            var colValor       = ColIdx("Valor");
            var colPeso        = ColIdx("Peso");

            var items = new List<object>();
            int ultimaFila = hoja.LastRowUsed()?.RowNumber() ?? 1;

            for (int fila = 2; fila <= ultimaFila; fila++)
            {
                var descripcion = hoja.Cell(fila, colDescripcion).GetString().Trim();
                if (string.IsNullOrEmpty(descripcion)) continue;

                decimal.TryParse(hoja.Cell(fila, colCantidad).GetString().Trim().Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var cantidad);
                decimal.TryParse(hoja.Cell(fila, colValor).GetString().Trim().Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var valor);
                decimal.TryParse(hoja.Cell(fila, colPeso).GetString().Trim().Replace(",", "."), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var peso);

                items.Add(new
                {
                    descripcion,
                    cantidad,
                    valor,
                    peso,
                    partidaArancelaria = (string?)null,
                    tieneRestriccion   = false
                });
            }

            if (items.Count == 0) // PA HU10-1.4 NOK — Excel con cabeceras correctas pero sin filas de datos
                return BadRequest(new { mensaje = "El archivo no contiene ítems para extraer. Verifique que el Excel tenga datos cargados." });

            return Ok(items); // PA HU10-1 OK — extracción exitosa, lista de ítems retornada
        }
        catch (Exception) // PA HU10-1.5 NOK — error interno al procesar el archivo (archivo corrupto, etc.)
        {
            return StatusCode(500, new { mensaje = "No se pudo procesar el archivo. Verifique su conexión e intente nuevamente." });
        }
    }
}
