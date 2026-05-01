using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartidaArancelariaController : ControllerBase
{
    private readonly PartidaArancelariaService _partidaService;

    public PartidaArancelariaController(PartidaArancelariaService partidaService)
    {
        _partidaService = partidaService;
    }

    [HttpPost("asignar")]
    public async Task<IActionResult> AsignarPartida([FromBody] AsignacionPartidaRequest request)
    {
        try
        {
            var result = await _partidaService.AsignarPartidaAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("buscar/{codigo}")]
    public async Task<IActionResult> BuscarPartida(string codigo)
    {
        try
        {
            var partida = await _partidaService.BuscarPartidaAsync(codigo);
            return Ok(partida);
        }
        catch (Exception ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpGet("despacho/{id}")]
    public async Task<IActionResult> ObtenerPartidasDespacho(int id)
    {
        try
        {
            var partidas = await _partidaService.ObtenerPartidasDespachoAsync(id);
            return Ok(partidas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
