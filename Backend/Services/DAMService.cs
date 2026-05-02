using LogisticaBroker.Data;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Services;

public class DAMService
{
    private readonly IUnitOfWork _uow;
    private readonly AppDbContext _context;

    public DAMService(IUnitOfWork uow, AppDbContext context)
    {
        _uow = uow;
        _context = context;
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
            throw new InvalidOperationException("La DAM ya está finalizada");

        // 1. Bloquear la DAM
        dam.EdicionBloqueada  = true;
        dam.Estado            = "Finalizado";
        dam.FechaFinalizacion = DateTime.UtcNow;

        // 2. Actualizar estado del despacho → "Liquidación Terminada" (CA4)
        var despacho = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        despacho.Estado = "Liquidación Terminada";

        // 3. Registrar etapa en EtapasDespacho (IdTipoEtapa 4 = Generación DAM)
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.IdUsuario == dam.IdUsuarioCreador);

        var etapaExistente = await _context.EtapasDespacho
            .FirstOrDefaultAsync(e => e.IdDespacho == idDespacho && e.IdTipoEtapa == 4);

        if (etapaExistente is null)
        {
            _context.EtapasDespacho.Add(new EtapaDespacho
            {
                IdDespacho           = idDespacho,
                IdTipoEtapa          = 4,
                IdUsuarioResponsable = dam.IdUsuarioCreador,
                Estado               = "Finalizado",
                Descripcion          = "DAM generada y bloqueada oficialmente",
                FechaHora            = DateTime.UtcNow
            });
        }
        else
        {
            etapaExistente.Estado    = "Finalizado";
            etapaExistente.FechaHora = DateTime.UtcNow;
        }

        await _uow.SaveChangesAsync();

        return MapToResponseDto(dam);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/DAM/{idDespacho}/etapas
    // ─────────────────────────────────────────────────────────
    public async Task<List<EtapaDespachoDto>> ObtenerEtapasAsync(int idDespacho)
    {
        _ = await _uow.Despachos.GetByIdAsync(idDespacho)
            ?? throw new KeyNotFoundException("Despacho no encontrado");

        var tiposEtapa = await _context.TiposEtapa
            .OrderBy(t => t.Orden)
            .ToListAsync();

        var etapasRegistradas = await _context.EtapasDespacho
            .Where(e => e.IdDespacho == idDespacho)
            .ToListAsync();

        return tiposEtapa.Select(tipo =>
        {
            var etapa = etapasRegistradas
                .FirstOrDefault(e => e.IdTipoEtapa == tipo.IdTipoEtapa);
            return new EtapaDespachoDto
            {
                IdTipoEtapa = tipo.IdTipoEtapa,
                Nombre      = tipo.Nombre,
                Orden       = tipo.Orden,
                Estado      = etapa?.Estado ?? "Pendiente",
                FechaHora   = etapa?.FechaHora
            };
        }).ToList();
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

    public async Task<DamResponseDto> ActualizarBorradorAsync(int idDespacho, CrearDamDto dto)
    {
        var dam = await _uow.Dams.GetByDespachoAsync(idDespacho)
            ?? throw new KeyNotFoundException("No se encontró una DAM para este despacho");

        if (dam.EdicionBloqueada)
            throw new InvalidOperationException("La DAM está finalizada y no puede editarse");

        dam.ImportadorExportador   = dto.ImportadorExportador;
        dam.CodDocIdentificacion   = dto.CodDocIdentificacion;
        dam.DireccionImportador    = dto.DireccionImportador;
        dam.EmpresaTransporte      = dto.EmpresaTransporte;
        dam.ViaTransporte          = dto.ViaTransporte ?? "Marítimo";
        dam.PuertoEmbarque         = dto.PuertoEmbarque;
        dam.TerminalAlmacenamiento = dto.TerminalAlmacenamiento;
        dam.ValorFob               = dto.ValorFob;
        dam.Flete                  = dto.Flete;
        dam.Seguro                 = dto.Seguro;
        dam.TotalAjustes           = dto.TotalAjustes;

        await _uow.SaveChangesAsync();

        return MapToResponseDto(dam);
    }
}
