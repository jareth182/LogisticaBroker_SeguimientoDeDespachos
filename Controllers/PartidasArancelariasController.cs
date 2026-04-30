using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/despachos/{idDespacho:int}/partidas")]
public class PartidasArancelariasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PartidasArancelariasController(AppDbContext context)
    {
        _context = context;
    }

    // ─────────────────────────────────────────────────────────
    // GET api/despachos/{idDespacho}/partidas
    // Lista todas las partidas de un despacho
    // ─────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> ObtenerPartidas(int idDespacho)
    {
        // Verificar que el despacho existe
        var despacho = await _context.Despachos
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado" });

        // Buscar la DAM del despacho
        var dam = await _context.Dams
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

        if (dam is null)
            return NotFound(new { mensaje = "Este despacho aún no tiene una DAM generada" });

        // Obtener las partidas de esa DAM
        var partidas = await _context.PartidasArancelarias
            .Where(p => p.IdDam == dam.IdDam)
            .Select(p => new PartidaArancelariaResponseDto
            {
                IdPartida            = p.IdPartida,
                IdDam                = p.IdDam,
                PartidaNacional      = p.PartidaNacional,
                SubpartidaNaban      = p.SubpartidaNaban,
                CantidadBultos       = p.CantidadBultos,
                PesoNetoKg           = p.PesoNetoKg,
                PesoBrutoKg          = p.PesoBrutoKg,
                DescripcionMercancias = p.DescripcionMercancias
            })
            .ToListAsync();

        return Ok(partidas);
    }

    // ─────────────────────────────────────────────────────────
    // POST api/despachos/{idDespacho}/partidas
    // Asignar una nueva partida arancelaria — HU09
    // ─────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> AsignarPartida(int idDespacho, [FromBody] CrearPartidaArancelariaDto dto)
    {
        // 1. Validar que el DTO es correcto (los 10 dígitos, etc.)
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 2. Verificar que el despacho existe
        var despacho = await _context.Despachos
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado" });

        // 3. Verificar que el despacho está en estado "En Apertura" — HU09 criterio 1
        if (despacho.Estado != "En proceso")
            return BadRequest(new { mensaje = "Solo se pueden asignar partidas a despachos en estado 'En proceso'" });

        // 4. Verificar que existe una DAM para este despacho
        var dam = await _context.Dams
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

        if (dam is null)
            return BadRequest(new { mensaje = "Este despacho no tiene una DAM generada. Primero genera el borrador de DAM" });

        // 5. Verificar que la DAM no está bloqueada
        if (dam.EdicionBloqueada)
            return BadRequest(new { mensaje = "La DAM está finalizada y no permite más cambios" });

        // 6. Crear la partida arancelaria
        var partida = new PartidaArancelaria
        {
            IdDam                 = dam.IdDam,
            PartidaNacional       = dto.PartidaNacional,
            SubpartidaNaban       = dto.SubpartidaNaban,
            CantidadBultos        = dto.CantidadBultos,
            PesoNetoKg            = dto.PesoNetoKg,
            PesoBrutoKg           = dto.PesoBrutoKg,
            DescripcionMercancias = dto.DescripcionMercancias
        };

        _context.PartidasArancelarias.Add(partida);

        // 7. Marcar la etapa correspondiente como "Clasificado" — HU09 criterio 2
        var etapaClasificacion = await _context.EtapasDespacho
            .FirstOrDefaultAsync(e => e.IdDespacho == idDespacho && e.IdTipoEtapa == 2); // Transmisión DUA

        if (etapaClasificacion is not null)
        {
            etapaClasificacion.Estado    = "Clasificado";
            etapaClasificacion.FechaHora = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // 8. Responder con la partida creada
        var respuesta = new PartidaArancelariaResponseDto
        {
            IdPartida             = partida.IdPartida,
            IdDam                 = partida.IdDam,
            PartidaNacional       = partida.PartidaNacional,
            SubpartidaNaban       = partida.SubpartidaNaban,
            CantidadBultos        = partida.CantidadBultos,
            PesoNetoKg            = partida.PesoNetoKg,
            PesoBrutoKg           = partida.PesoBrutoKg,
            DescripcionMercancias = partida.DescripcionMercancias
        };

        return CreatedAtAction(nameof(ObtenerPartidas), new { idDespacho }, respuesta);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE api/despachos/{idDespacho}/partidas/{idPartida}
    // Eliminar una partida arancelaria
    // ─────────────────────────────────────────────────────────
    [HttpDelete("{idPartida:int}")]
    public async Task<IActionResult> EliminarPartida(int idDespacho, int idPartida)
    {
        var dam = await _context.Dams
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

        if (dam is null)
            return NotFound(new { mensaje = "DAM no encontrada para este despacho" });

        if (dam.EdicionBloqueada)
            return BadRequest(new { mensaje = "La DAM está finalizada y no permite eliminar partidas" });

        var partida = await _context.PartidasArancelarias
            .FirstOrDefaultAsync(p => p.IdPartida == idPartida && p.IdDam == dam.IdDam);

        if (partida is null)
            return NotFound(new { mensaje = "Partida no encontrada" });

        _context.PartidasArancelarias.Remove(partida);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Partida eliminada correctamente" });
    }
}
