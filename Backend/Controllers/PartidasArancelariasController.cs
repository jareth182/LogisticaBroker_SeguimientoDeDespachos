using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/despachos/{idDespacho:int}/partidas")]
public class PartidasArancelariasController : ControllerBase
{
    private readonly PartidaArancelariaService _service;

    public PartidasArancelariasController(PartidaArancelariaService service)
    {
        _service = service;
    }

    // ─────────────────────────────────────────────────────────
    // GET api/despachos/{idDespacho}/partidas
    // ─────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> ObtenerPartidas(int idDespacho)
    {
        try
        {
            var partidas = await _service.ObtenerPartidasAsync(idDespacho);
            return Ok(partidas);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST api/despachos/{idDespacho}/partidas — HU09
    // ─────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> AsignarPartida(
        int idDespacho, [FromBody] CrearPartidaArancelariaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var resultado = await _service.AsignarPartidaAsync(idDespacho, dto);
            return CreatedAtAction(nameof(ObtenerPartidas), new { idDespacho }, resultado);
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
    // DELETE api/despachos/{idDespacho}/partidas/{idPartida}
    // ─────────────────────────────────────────────────────────
    [HttpDelete("{idPartida:int}")]
    public async Task<IActionResult> EliminarPartida(int idDespacho, int idPartida)
    {
        try
        {
            await _service.EliminarPartidaAsync(idDespacho, idPartida);
            return Ok(new { mensaje = "Partida eliminada correctamente" });
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
