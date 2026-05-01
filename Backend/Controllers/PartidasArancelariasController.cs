using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/despachos/{idDespacho:int}/partidas")]
public class PartidasArancelariasController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public PartidasArancelariasController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // ─────────────────────────────────────────────────────────
    // GET api/despachos/{idDespacho}/partidas
    // ─────────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> ObtenerPartidas(int idDespacho)
    {
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho);
        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado" });

        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho);
        if (dam is null)
            return NotFound(new { mensaje = "Este despacho aún no tiene una DAM generada" });

        var partidas = await _uow.Partidas.GetByDamAsync(dam.IdDam);

        var respuesta = partidas.Select(p => new PartidaArancelariaResponseDto
        {
            IdPartida             = p.IdPartida,
            IdDam                 = p.IdDam,
            PartidaNacional       = p.PartidaNacional,
            SubpartidaNaban       = p.SubpartidaNaban,
            CantidadBultos        = p.CantidadBultos,
            PesoNetoKg            = p.PesoNetoKg,
            PesoBrutoKg           = p.PesoBrutoKg,
            DescripcionMercancias = p.DescripcionMercancias
        });

        return Ok(respuesta);
    }

    // ─────────────────────────────────────────────────────────
    // POST api/despachos/{idDespacho}/partidas — HU09
    // ─────────────────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> AsignarPartida(int idDespacho, [FromBody] CrearPartidaArancelariaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 1. Verificar que el despacho existe
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho);
        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado" });

        // 2. Verificar estado del despacho — HU09 criterio 1
        if (despacho.Estado != "En proceso")
            return BadRequest(new { mensaje = "Solo se pueden asignar partidas a despachos en estado 'En proceso'" });

        // 3. Verificar que existe una DAM
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho);
        if (dam is null)
            return BadRequest(new { mensaje = "Este despacho no tiene una DAM generada. Primero genera el borrador de DAM" });

        // 4. Verificar que la DAM no está bloqueada
        if (dam.EdicionBloqueada)
            return BadRequest(new { mensaje = "La DAM está finalizada y no permite más cambios" });

        // 5. Crear la partida
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

        await _uow.Partidas.AddAsync(partida);

        // 6. Marcar etapa como "Clasificado" — HU09 criterio 2
        var despachoConEtapas = await _uow.Despachos.GetDespachoConEtapasAsync(idDespacho);
        var etapa = despachoConEtapas?.Etapas
            .FirstOrDefault(e => e.IdTipoEtapa == 2); // Transmisión DUA

        if (etapa is not null)
        {
            etapa.Estado    = "Clasificado";
            etapa.FechaHora = DateTime.UtcNow;
            _uow.Despachos.Update(despachoConEtapas!);
        }

        await _uow.SaveChangesAsync();

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
    // ─────────────────────────────────────────────────────────
    [HttpDelete("{idPartida:int}")]
    public async Task<IActionResult> EliminarPartida(int idDespacho, int idPartida)
    {
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho);
        if (dam is null)
            return NotFound(new { mensaje = "DAM no encontrada para este despacho" });

        if (dam.EdicionBloqueada)
            return BadRequest(new { mensaje = "La DAM está finalizada y no permite eliminar partidas" });

        var partidas = await _uow.Partidas.GetByDamAsync(dam.IdDam);
        var partida  = partidas.FirstOrDefault(p => p.IdPartida == idPartida);

        if (partida is null)
            return NotFound(new { mensaje = "Partida no encontrada" });

        _uow.Partidas.Delete(partida);
        await _uow.SaveChangesAsync();

        return Ok(new { mensaje = "Partida eliminada correctamente" });
    }
}