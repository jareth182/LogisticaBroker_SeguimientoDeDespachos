using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DAMController : ControllerBase
{
    private readonly DAMService _damService;

    public DAMController(DAMService damService)
    {
        _damService = damService;
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/DAM/generar-borrador
    // ─────────────────────────────────────────────────────────
    [HttpPost("generar-borrador")]
    public async Task<IActionResult> GenerarBorrador([FromBody] CrearDamDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _damService.GenerarBorradorAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/DAM/{idDespacho}/borrador
    // ─────────────────────────────────────────────────────────
    [HttpGet("{idDespacho}/borrador")]
    public async Task<IActionResult> ObtenerBorrador(int idDespacho)
    {
        try
        {
            var borrador = await _damService.ObtenerBorradorAsync(idDespacho);
            return Ok(borrador);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/DAM/{idDespacho}/finalizar
    // ─────────────────────────────────────────────────────────
    [HttpPost("{idDespacho}/finalizar")]
    public async Task<IActionResult> FinalizarDAM(int idDespacho)
    {
        try
        {
            var result = await _damService.FinalizarDAMAsync(idDespacho);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
