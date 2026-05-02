using LogisticaBroker.Data;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Services;

public class PartidaArancelariaService
{
    private readonly IUnitOfWork _uow;
    private readonly AppDbContext _context;

    public PartidaArancelariaService(IUnitOfWork uow, AppDbContext context)
    {
        _uow     = uow;
        _context = context;
    }

    public async Task<PartidaArancelariaResponseDto> AsignarPartidaAsync(
        int idDespacho, CrearPartidaArancelariaDto dto)
    {
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        if (despacho.Estado != "En Apertura")
            throw new InvalidOperationException(
                "Solo se pueden asignar partidas a despachos en estado 'En Apertura'");

        // Vincular con DAM si existe (opcional)
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho);

        var partida = new PartidaArancelaria
        {
            IdDespacho            = idDespacho,
            IdDam                 = dam?.IdDam,   // null si no hay DAM aún
            PartidaNacional       = dto.PartidaNacional,
            SubpartidaNaban       = dto.SubpartidaNaban,
            CantidadBultos        = dto.CantidadBultos,
            PesoNetoKg            = dto.PesoNetoKg,
            PesoBrutoKg           = dto.PesoBrutoKg,
            DescripcionMercancias = dto.DescripcionMercancias
        };

        await _uow.Partidas.AddAsync(partida);

        // Registrar etapa de Clasificación (IdTipoEtapa = 2)
        var etapaExistente = await _context.EtapasDespacho
            .FirstOrDefaultAsync(e => e.IdDespacho == idDespacho && e.IdTipoEtapa == 2);

        if (etapaExistente is null)
        {
            _context.EtapasDespacho.Add(new EtapaDespacho
            {
                IdDespacho  = idDespacho,
                IdTipoEtapa = 2,
                Estado      = "Finalizado",
                Descripcion = "Partida arancelaria clasificada correctamente",
                FechaHora   = DateTime.UtcNow
            });
        }
        else
        {
            etapaExistente.Estado    = "Finalizado";
            etapaExistente.FechaHora = DateTime.UtcNow;
        }

        await _uow.SaveChangesAsync();
        return MapToResponseDto(partida);
    }

    public async Task<IEnumerable<PartidaArancelariaResponseDto>> ObtenerPartidasAsync(
        int idDespacho)
    {
        _ = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        var partidas = await _context.PartidasArancelarias
            .Where(p => p.IdDespacho == idDespacho)
            .ToListAsync();

        return partidas.Select(MapToResponseDto);
    }

    public async Task EliminarPartidaAsync(int idDespacho, int idPartida)
    {
        var partida = await _context.PartidasArancelarias
            .FirstOrDefaultAsync(p => p.IdPartida == idPartida && p.IdDespacho == idDespacho)
            ?? throw new KeyNotFoundException("Partida no encontrada");

        // No eliminar si DAM está finalizada
        if (partida.IdDam.HasValue)
        {
            var dam = await _uow.Dams.GetByDespachoAsync(idDespacho);
            if (dam?.EdicionBloqueada == true)
                throw new InvalidOperationException(
                    "La DAM está finalizada y no permite eliminar partidas");
        }

        _uow.Partidas.Delete(partida);
        await _uow.SaveChangesAsync();
    }

    private static PartidaArancelariaResponseDto MapToResponseDto(PartidaArancelaria p) =>
        new()
        {
            IdPartida             = p.IdPartida,
            IdDam                 = p.IdDam ?? 0,
            PartidaNacional       = p.PartidaNacional,
            SubpartidaNaban       = p.SubpartidaNaban,
            CantidadBultos        = p.CantidadBultos,
            PesoNetoKg            = p.PesoNetoKg,
            PesoBrutoKg           = p.PesoBrutoKg,
            DescripcionMercancias = p.DescripcionMercancias
        };
}