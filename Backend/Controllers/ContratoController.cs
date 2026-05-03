using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Services;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContratoController : ControllerBase
{
    private readonly ContratoService _contratoService;
    private readonly CloudStorageService _storageService;
    private readonly AppDbContext _context;

    public ContratoController(ContratoService contratoService, CloudStorageService storageService, AppDbContext context)
    {
        _contratoService = contratoService;
        _storageService = storageService;
        _context = context;
    }

    [HttpGet("empresa/{idEmpresa}")]
    public async Task<IActionResult> GetContratosByEmpresa(int idEmpresa)
    {
        try
        {
            var contratos = await _context.ContratosServicio
                .Where(c => c.IdEmpresa == idEmpresa)
                .OrderByDescending(c => c.FechaGeneracion)
                .Select(c => new {
                    id = c.IdContrato,
                    empresaId = c.IdEmpresa,
                    titulo = c.Titulo,
                    version = c.Version,
                    estado = c.EstadoFirma,
                    fechaCreacion = c.FechaGeneracion,
                    fechaFirma = c.FechaFirma,
                    tieneSelloDigital = c.EstadoFirma == "Firmado",
                    tipo = "Contrato"
                })
                .ToListAsync();

            return Ok(contratos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpPost("crear")]
    public async Task<IActionResult> CrearContrato([FromBody] ContratoServicio contrato)
    {
        try
        {
            var result = await _contratoService.CrearContratoAsync(contrato);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/firmar")]
    public async Task<IActionResult> FirmarContrato(int id, [FromBody] FirmaRequest request)
    {
        try
        {
            var result = await _contratoService.FirmarContratoAsync(id, request);
            
            // Guardar en almacenamiento en la nube
            var storageUrl = await _storageService.GuardarContratoFirmadoAsync(id, result.ContratoFirmado);
            
            return Ok(new { 
                mensaje = "Contrato firmado correctamente", 
                urlAlmacenamiento = storageUrl,
                firmaDigital = result.FirmaDigital
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerContrato(int id)
    {
        try
        {
            var contrato = await _context.ContratosServicio
                .Where(c => c.IdContrato == id)
                .Select(c => new {
                    id = c.IdContrato,
                    empresaId = c.IdEmpresa,
                    numeroContrato = $"CTR-{c.IdContrato}",
                    tipoContrato = "Servicios Logísticos",
                    titulo = c.Titulo,
                    descripcion = "Contrato para servicios de importación y despacho aduanero",
                    fechaCreacion = c.FechaGeneracion,
                    fechaFirma = c.FechaFirma,
                    estado = c.EstadoFirma,
                    contenido = "Contenido del contrato...",
                    firmaDigital = c.TokenFirma,
                    urlDocumento = c.UrlDocumento
                })
                .FirstOrDefaultAsync();

            if (contrato == null)
            {
                return NotFound(new { error = "Contrato no encontrado" });
            }

            return Ok(contrato);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpGet("{id}/documento")]
    public async Task<IActionResult> ObtenerDocumentoContrato(int id)
    {
        try
        {
            var documento = await _storageService.ObtenerContratoAsync(id);
            return File(documento.Contenido, "application/pdf", documento.NombreArchivo);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
