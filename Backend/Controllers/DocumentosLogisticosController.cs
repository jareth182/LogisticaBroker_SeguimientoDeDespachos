using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentosLogisticosController : ControllerBase
{
    private readonly AppDbContext _context;

    public DocumentosLogisticosController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/DocumentosLogisticos/{idDespacho}
    [HttpGet("{idDespacho}")]
    public async Task<IActionResult> ObtenerPorDespacho(int idDespacho)
    {
        var docs = await _context.DocumentosLogisticos
            .Where(d => d.IdDespacho == idDespacho)
            .OrderByDescending(d => d.FechaCarga)
            .Select(d => new
            {
                d.IdDocumentoLogistico,
                d.TipoDocumento,
                d.NombreArchivo,
                d.RutaArchivo,
                d.TamanoBytes,
                d.FechaCarga
            })
            .ToListAsync();

        return Ok(docs);
    }

    // POST /api/DocumentosLogisticos/{idDespacho}/subir
    [HttpPost("{idDespacho}/subir")]
    public async Task<IActionResult> SubirDocumento(int idDespacho, [FromForm] SubirDocumentoRequest request)
    {
        var despacho = await _context.Despachos.FindAsync(idDespacho);
        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado." });

        if (request.Archivo is null || request.Archivo.Length == 0) // PA HU09-2 NOK — sin archivo adjunto
            return BadRequest(new { mensaje = "Debe seleccionar el tipo de documento antes de subir el archivo." });

        if (string.IsNullOrWhiteSpace(request.TipoDocumento)) // PA HU09-2.3 NOK — tipo de documento no seleccionado
            return BadRequest(new { mensaje = "Debe seleccionar el tipo de documento antes de subir el archivo." });

        const long maxBytes = 5 * 1024 * 1024; // 5 MB
        if (request.Archivo.Length > maxBytes) // PA HU09-2.1 NOK — archivo supera el límite de 5 MB
            return BadRequest(new { mensaje = "El archivo supera el límite permitido de 5 MB. Comprima o reduzca el tamaño antes de subirlo." });

        var extension = Path.GetExtension(request.Archivo.FileName).ToLowerInvariant();
        var permitidos = new[] { ".pdf", ".jpg", ".jpeg" };
        if (!permitidos.Contains(extension)) // PA HU09-2.2 NOK — formato de archivo no permitido
            return BadRequest(new { mensaje = "Formato no admitido. Solo se permiten archivos PDF o JPG." });

        // Simular URL de almacenamiento (consistente con CloudStorageService)
        var nombreArchivo = request.Archivo.FileName;
        var rutaSimulada = $"https://storage.logisticabroker.com/despachos/{idDespacho}/{Guid.NewGuid():N}{extension}";

        var usuario = await _context.Usuarios.FirstOrDefaultAsync();
        var idUsuario = usuario?.IdUsuario ?? 1;

        var doc = new DocumentoLogistico
        {
            IdDespacho       = idDespacho,
            TipoDocumento    = request.TipoDocumento,
            NombreArchivo    = nombreArchivo,
            RutaArchivo      = rutaSimulada,
            TamanoBytes      = request.Archivo.Length,
            FechaCarga       = DateTime.UtcNow,
            IdUsuarioCargador = idUsuario
        };

        _context.DocumentosLogisticos.Add(doc);
        await _context.SaveChangesAsync();

        return Ok(new // PA HU09-2 OK — archivo guardado y asociado al despacho
        {
            doc.IdDocumentoLogistico,
            doc.TipoDocumento,
            doc.NombreArchivo,
            doc.RutaArchivo,
            doc.TamanoBytes,
            doc.FechaCarga,
            mensaje = "Documento guardado correctamente. El documento se encuentra con estado 'En revisión'."
        });
    }

    // GET /api/DocumentosLogisticos/descargar/{idDocumento}
    [HttpGet("descargar/{idDocumento}")]
    public async Task<IActionResult> DescargarDocumento(int idDocumento)
    {
        var doc = await _context.DocumentosLogisticos.FindAsync(idDocumento);
        if (doc is null) // PA HU09-3.2 NOK — archivo ya no disponible (eliminado del servidor)
            return NotFound(new { mensaje = "El documento no está disponible en este momento. Contacte al administrador del sistema." });

        // PA HU09-3 OK — documento encontrado, devuelve URL para descarga
        return Ok(new
        {
            doc.NombreArchivo,
            doc.RutaArchivo,
            doc.TipoDocumento,
            doc.TamanoBytes
        });
    }

    // DELETE /api/DocumentosLogisticos/{idDocumento}
    [HttpDelete("{idDocumento}")]
    public async Task<IActionResult> EliminarDocumento(int idDocumento)
    {
        var doc = await _context.DocumentosLogisticos.FindAsync(idDocumento);
        if (doc is null)
            return NotFound(new { mensaje = "Documento no encontrado." });

        _context.DocumentosLogisticos.Remove(doc);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Documento eliminado correctamente." });
    }
}

public class SubirDocumentoRequest
{
    public string? TipoDocumento { get; set; }
    public IFormFile? Archivo { get; set; }
}
