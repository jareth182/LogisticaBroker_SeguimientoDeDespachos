using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Services;

public class PartidaArancelariaService
{
    private readonly IUnitOfWork _uow;

    public PartidaArancelariaService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // ─────────────────────────────────────────────────────────
    // HU09 — Asignar partida arancelaria
    // ─────────────────────────────────────────────────────────
    public async Task<PartidaArancelariaResponseDto> AsignarPartidaAsync(
        int idDespacho, CrearPartidaArancelariaDto dto)
    {
        // 1. Verificar que el despacho existe
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        // 2. Verificar estado del despacho — HU09 criterio 1
        if (despacho.Estado != "En Apertura")
            throw new InvalidOperationException(
                "Solo se pueden asignar partidas a despachos en estado 'En Apertura'");

        // 3. Verificar que existe una DAM
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho)
            ?? throw new InvalidOperationException(
                "Este despacho no tiene una DAM generada. Primero genera el borrador de DAM");

        // 4. Verificar que la DAM no está bloqueada
        if (dam.EdicionBloqueada)
            throw new InvalidOperationException(
                "La DAM está finalizada y no permite más cambios");

        // 5. Crear y guardar la partida
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

        return MapToResponseDto(partida);
    }

    // ─────────────────────────────────────────────────────────
    // Obtener todas las partidas de un despacho
    // ─────────────────────────────────────────────────────────
    public async Task<IEnumerable<PartidaArancelariaResponseDto>> ObtenerPartidasAsync(
        int idDespacho)
    {
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho)
            ?? throw new KeyNotFoundException(
                "Este despacho aún no tiene una DAM generada");

        var partidas = await _uow.Partidas.GetByDamAsync(dam.IdDam);

        return partidas.Select(MapToResponseDto);
    }

    // ─────────────────────────────────────────────────────────
    // Eliminar una partida
    // ─────────────────────────────────────────────────────────
    public async Task EliminarPartidaAsync(int idDespacho, int idPartida)
    {
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho)
            ?? throw new KeyNotFoundException("DAM no encontrada para este despacho");

        if (dam.EdicionBloqueada)
            throw new InvalidOperationException(
                "La DAM está finalizada y no permite eliminar partidas");

        var partidas = await _uow.Partidas.GetByDamAsync(dam.IdDam);
        var partida  = partidas.FirstOrDefault(p => p.IdPartida == idPartida)
            ?? throw new KeyNotFoundException("Partida no encontrada");

        _uow.Partidas.Delete(partida);
        await _uow.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────
    // Mapeo privado Model → DTO
    // ─────────────────────────────────────────────────────────
    private static PartidaArancelariaResponseDto MapToResponseDto(PartidaArancelaria p) =>
        new()
        {
            IdPartida             = p.IdPartida,
            IdDam                 = p.IdDam,
            PartidaNacional       = p.PartidaNacional,
            SubpartidaNaban       = p.SubpartidaNaban,
            CantidadBultos        = p.CantidadBultos,
            PesoNetoKg            = p.PesoNetoKg,
            PesoBrutoKg           = p.PesoBrutoKg,
            DescripcionMercancias = p.DescripcionMercancias
        };
}
