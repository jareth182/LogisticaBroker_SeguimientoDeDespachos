using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContratoController : ControllerBase
{
    private readonly ContratoService _contratoService;
    private readonly CloudStorageService _storageService;

    public ContratoController(ContratoService contratoService, CloudStorageService storageService)
    {
        _contratoService = contratoService;
        _storageService = storageService;
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
            var contrato = await _contratoService.ObtenerContratoAsync(id);
            
            // Mapear a DTO compatible con frontend
            var contratoDto = new {
                id = contrato.IdContrato,
                empresaId = contrato.IdEmpresa,
                numeroContrato = $"CTR-{contrato.IdContrato}",
                tipoContrato = "Servicios Logísticos",
                titulo = contrato.Titulo,
                descripcion = "Contrato para servicios de importación y despacho aduanero",
                fechaCreacion = contrato.FechaGeneracion,
                fechaFirma = contrato.FechaFirma,
                estado = contrato.EstadoFirma,
                contenido = "Contenido del contrato...",
                firmaDigital = contrato.TokenFirma,
                urlDocumento = contrato.UrlDocumento
            };
            
            return Ok(contratoDto);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
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
