using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Services;

public class DAMService
{
    private readonly IUnitOfWork _uow;

    public DAMService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/DAM/generar-borrador
    // ─────────────────────────────────────────────────────────
    public async Task<DamResponseDto> GenerarBorradorAsync(CrearDamDto dto)
    {
        // 1. Verificar que el despacho existe
        var despacho = await _uow.Despachos.GetByIdAsync(dto.IdDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        // 2. Verificar que no tenga ya una DAM
        var damExistente = await _uow.Dams.GetByDespachoAsync(dto.IdDespacho);
        if (damExistente is not null)
            throw new InvalidOperationException(
                "Este despacho ya tiene una DAM generada");

        // 3. Crear la DAM
        var dam = new Dam
        {
            IdDespacho              = dto.IdDespacho,
            IdUsuarioCreador        = dto.IdUsuarioCreador,
            ImportadorExportador    = dto.ImportadorExportador,
            CodDocIdentificacion    = dto.CodDocIdentificacion,
            DireccionImportador     = dto.DireccionImportador,
            EmpresaTransporte       = dto.EmpresaTransporte,
            ViaTransporte           = dto.ViaTransporte ?? "Marítimo",
            PuertoEmbarque          = dto.PuertoEmbarque,
            TerminalAlmacenamiento  = dto.TerminalAlmacenamiento,
            ValorFob                = dto.ValorFob,
            Flete                   = dto.Flete,
            Seguro                  = dto.Seguro,
            TotalAjustes            = dto.TotalAjustes,
            Estado                  = "Borrador",
            EdicionBloqueada        = false,
            FechaCreacion           = DateTime.UtcNow
        };

        await _uow.Dams.AddAsync(dam);
        await _uow.SaveChangesAsync();

        return MapToResponseDto(dam);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/DAM/{idDespacho}/borrador
    // ─────────────────────────────────────────────────────────
    public async Task<DamResponseDto> ObtenerBorradorAsync(int idDespacho)
    {
        var dam = await _uow.Dams.GetDamConPartidasAsync(idDespacho)
            ?? throw new KeyNotFoundException(
                "No se encontró una DAM para este despacho");

        return MapToResponseDto(dam);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/DAM/{idDespacho}/finalizar
    // ─────────────────────────────────────────────────────────
    public async Task<DamResponseDto> FinalizarDAMAsync(int idDespacho)
    {
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho)
            ?? throw new KeyNotFoundException(
                "No se encontró una DAM para este despacho");

        if (dam.EdicionBloqueada)
            throw new InvalidOperationException(
                "La DAM ya está finalizada");

        dam.EdicionBloqueada  = true;
        dam.Estado            = "Finalizado";
        dam.FechaFinalizacion = DateTime.UtcNow;

        await _uow.SaveChangesAsync();

        return MapToResponseDto(dam);
    }

    // ─────────────────────────────────────────────────────────
    // Mapeo privado Model → DTO
    // ─────────────────────────────────────────────────────────
    private static DamResponseDto MapToResponseDto(Dam d) =>
        new()
        {
            IdDam                  = d.IdDam,
            IdDespacho             = d.IdDespacho,
            ImportadorExportador   = d.ImportadorExportador,
            CodDocIdentificacion   = d.CodDocIdentificacion,
            DireccionImportador    = d.DireccionImportador,
            EmpresaTransporte      = d.EmpresaTransporte,
            ViaTransporte          = d.ViaTransporte,
            PuertoEmbarque         = d.PuertoEmbarque,
            TerminalAlmacenamiento = d.TerminalAlmacenamiento,
            ValorFob               = d.ValorFob,
            Flete                  = d.Flete,
            Seguro                 = d.Seguro,
            TotalAjustes           = d.TotalAjustes,
            ValorCifTotal          = d.ValorCifTotal,
            Estado                 = d.Estado,
            EdicionBloqueada       = d.EdicionBloqueada,
            FechaCreacion          = d.FechaCreacion,
            FechaFinalizacion      = d.FechaFinalizacion
        };
}
