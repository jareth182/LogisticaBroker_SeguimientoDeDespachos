using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrazabilidadController : ControllerBase
{
    private readonly TrazabilidadService _trazabilidadService;

    public TrazabilidadController(TrazabilidadService trazabilidadService)
    {
        _trazabilidadService = trazabilidadService;
    }

    [HttpGet("despacho/{id}")]
    public async Task<IActionResult> ObtenerTrazabilidadDespacho(int id)
    {
        try
        {
            var trazabilidad = await _trazabilidadService.ObtenerTrazabilidadDespachoAsync(id);
            return Ok(trazabilidad);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("evento")]
    public async Task<IActionResult> RegistrarEvento([FromBody] EventoTrazabilidad evento)
    {
        try
        {
            var result = await _trazabilidadService.RegistrarEventoAsync(evento);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> ObtenerDashboard()
    {
        try
        {
            var dashboard = await _trazabilidadService.ObtenerDashboardAsync();
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
