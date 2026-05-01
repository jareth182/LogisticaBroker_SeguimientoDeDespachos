using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
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

    [HttpPost("generar-borrador")]
    public async Task<IActionResult> GenerarBorrador([FromBody] DAMRequest request)
    {
        try
        {
            var result = await _damService.GenerarBorradorAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/borrador")]
    public async Task<IActionResult> ObtenerBorrador(int id)
    {
        try
        {
            var borrador = await _damService.ObtenerBorradorAsync(id);
            return Ok(borrador);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/finalizar")]
    public async Task<IActionResult> FinalizarDAM(int id)
    {
        try
        {
            var result = await _damService.FinalizarDAMAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
