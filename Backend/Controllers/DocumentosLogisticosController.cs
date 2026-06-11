using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentosLogisticosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EmailService _email;
    private readonly IWebHostEnvironment _environment;

    public DocumentosLogisticosController(AppDbContext context, EmailService email, IWebHostEnvironment environment)
    {
        _context = context;
        _email = email;
        _environment = environment;
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
                d.FechaCarga,
                d.Estado,
                d.Observacion
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
        var permitidos = new[] { ".pdf", ".jpg", ".jpeg", ".xls", ".xlsx" };
        if (!permitidos.Contains(extension)) // PA HU09-2.2 NOK — formato de archivo no permitido
            return BadRequest(new { mensaje = "Formato no admitido. Solo se permiten archivos PDF, JPG o Excel (.xls/.xlsx)." });

        var nombreArchivo = request.Archivo.FileName;
        var nombreFisico = $"{Guid.NewGuid():N}{extension}";
        var carpeta = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "documentos", idDespacho.ToString());
        Directory.CreateDirectory(carpeta);

        var rutaFisica = Path.Combine(carpeta, nombreFisico);
        using (var stream = System.IO.File.Create(rutaFisica))
        {
            await request.Archivo.CopyToAsync(stream);
        }

        var rutaPublica = $"{Request.Scheme}://{Request.Host}/uploads/documentos/{idDespacho}/{nombreFisico}";

        var usuario = await _context.Usuarios.FirstOrDefaultAsync();
        var idUsuario = usuario?.IdUsuario ?? 1;

        var doc = new DocumentoLogistico
        {
            IdDespacho       = idDespacho,
            TipoDocumento    = request.TipoDocumento,
            NombreArchivo    = nombreArchivo,
            RutaArchivo      = rutaPublica,
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

        // PA HU09-3 OK — documento encontrado, devuelve URL local para descarga
        return Ok(new
        {
            doc.NombreArchivo,
            doc.RutaArchivo,
            doc.TipoDocumento,
            doc.TamanoBytes
        });
    }

    // GET /api/DocumentosLogisticos/{idDocumento}/archivo
    [HttpGet("{idDocumento}/archivo")]
    public async Task<IActionResult> ObtenerArchivo(int idDocumento)
    {
        var doc = await _context.DocumentosLogisticos.FindAsync(idDocumento);
        if (doc is null)
            return NotFound(new { mensaje = "Documento no encontrado." });

        var rutaFisica = ObtenerRutaFisica(doc.RutaArchivo);
        if (rutaFisica is null || !System.IO.File.Exists(rutaFisica))
            return NotFound(new { mensaje = "El archivo ya no está disponible en el servidor." });

        var extension = Path.GetExtension(rutaFisica).ToLowerInvariant();
        var contentType = extension switch
        {
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls" => "application/vnd.ms-excel",
            ".pdf" => "application/pdf",
            ".jpg" => "image/jpeg",
            ".jpeg" => "image/jpeg",
            _ => "application/octet-stream"
        };

        return PhysicalFile(rutaFisica, contentType, doc.NombreArchivo);
    }

    // PATCH /api/DocumentosLogisticos/{idDocumento}/revisar
    [HttpPatch("{idDocumento}/revisar")]
    public async Task<IActionResult> RevisarDocumento(int idDocumento, [FromBody] RevisarDocumentoRequest request)
    {
        var estadosValidos = new[] { "Aprobado", "Observado" };
        if (!estadosValidos.Contains(request.Estado))
            return BadRequest(new { mensaje = "Estado inválido. Use 'Aprobado' u 'Observado'." });

        if (request.Estado == "Observado" && string.IsNullOrWhiteSpace(request.Observacion))
            return BadRequest(new { mensaje = "Debe ingresar una observación al rechazar el documento." });

        var doc = await _context.DocumentosLogisticos
            .Include(d => d.Despacho)
                .ThenInclude(d => d.Empresa)
                    .ThenInclude(e => e.Usuarios)
            .FirstOrDefaultAsync(d => d.IdDocumentoLogistico == idDocumento);

        if (doc is null)
            return NotFound(new { mensaje = "Documento no encontrado." });

        doc.Estado = request.Estado;
        doc.Observacion = request.Estado == "Observado" ? request.Observacion : null;
        await _context.SaveChangesAsync();

        var correoCliente = doc.Despacho.Empresa.Usuarios
            .FirstOrDefault(u => u.IdRol == 2)?.Correo
            ?? doc.Despacho.Empresa.Correo;

        var asunto = request.Estado == "Aprobado"
            ? $"Documento aprobado — Despacho {doc.Despacho.CodigoBl}"
            : $"Documento con observaciones — Despacho {doc.Despacho.CodigoBl}";

        var cuerpo = request.Estado == "Aprobado"
            ? $@"<p>El documento <strong>{doc.NombreArchivo}</strong> del despacho <strong>{doc.Despacho.CodigoBl}</strong> ha sido <strong style='color:#16a34a'>aprobado</strong> por el área administrativa.</p>"
            : $@"<p>El documento <strong>{doc.NombreArchivo}</strong> del despacho <strong>{doc.Despacho.CodigoBl}</strong> requiere correcciones.</p>
                 <p><strong>Observación:</strong> {request.Observacion}</p>
                 <p>Por favor, cargue nuevamente el documento corregido.</p>";

        _ = Task.Run(async () =>
        {
            try { await _email.EnviarCorreoAsync(correoCliente, asunto, cuerpo); }
            catch { /* el correo es best-effort */ }
        });

        return Ok(new { doc.IdDocumentoLogistico, doc.Estado, doc.Observacion });
    }

    // DELETE /api/DocumentosLogisticos/{idDocumento}
    [HttpDelete("{idDocumento}")]
    public async Task<IActionResult> EliminarDocumento(int idDocumento)
    {
        var doc = await _context.DocumentosLogisticos.FindAsync(idDocumento);
        if (doc is null)
            return NotFound(new { mensaje = "Documento no encontrado." });

        var rutaFisica = ObtenerRutaFisica(doc.RutaArchivo);
        if (rutaFisica is not null && System.IO.File.Exists(rutaFisica))
            System.IO.File.Delete(rutaFisica);

        _context.DocumentosLogisticos.Remove(doc);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Documento eliminado correctamente." });
    }

    private string? ObtenerRutaFisica(string? rutaArchivo)
    {
        if (string.IsNullOrWhiteSpace(rutaArchivo))
            return null;

        if (!Uri.TryCreate(rutaArchivo, UriKind.Absolute, out var uri))
            return null;

        var rutaRelativa = uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var webRoot = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        return Path.Combine(webRoot, rutaRelativa);
    }
}

public class SubirDocumentoRequest
{
    public string? TipoDocumento { get; set; }
    public IFormFile? Archivo { get; set; }
}

public class RevisarDocumentoRequest
{
    public string Estado { get; set; } = null!;
    public string? Observacion { get; set; }
}
