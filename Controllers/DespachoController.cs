using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DespachoController : ControllerBase
{
    private readonly DespachoService _despachoService;

    public DespachoController(DespachoService despachoService)
    {
        _despachoService = despachoService;
    }

    [HttpPost("crear")]
    public async Task<IActionResult> CrearDespacho([FromBody] Despacho despacho)
    {
        try
        {
            var result = await _despachoService.CrearDespachoAsync(despacho);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerDespacho(int id)
    {
        try
        {
            var despacho = await _despachoService.ObtenerDespachoAsync(id);
            return Ok(despacho);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> ListarDespachos()
    {
        try
        {
            var despachos = await _despachoService.ListarDespachosAsync();
            return Ok(despachos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
