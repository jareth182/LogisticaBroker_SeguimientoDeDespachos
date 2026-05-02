using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrackingController : ControllerBase
{
    private readonly AppDbContext _context;

    public TrackingController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("despacho/activos")]
    public async Task<IActionResult> GetDespachosActivos()
    {
        try
        {
            var despachos = await _context.Despachos
                .Include(d => d.Empresa)
                .Include(d => d.Etapas)
                    .ThenInclude(e => e.TipoEtapa)
                .Where(d => d.Estado == "En proceso")
                .OrderByDescending(d => d.FechaCreacion)
                .Select(d => new {
                    d.IdDespacho,
                    d.CodigoBl,
                    d.CodigoOrden,
                    d.Nave,
                    d.Contenedor,
                    d.Origen,
                    d.Destino,
                    d.Eta,
                    d.Mercancia,
                    d.PorcentajeProgreso,
                    d.Estado,
                    d.FechaCreacion,
                    empresa = new {
                        d.Empresa.IdEmpresa,
                        d.Empresa.RazonSocial,
                        d.Empresa.Ruc
                    },
                    etapas = d.Etapas
                        .OrderBy(e => e.TipoEtapa.Orden)
                        .Select(e => new {
                            e.IdEtapa,
                            e.IdDespacho,
                            e.IdTipoEtapa,
                            e.Estado,
                            e.FechaHora,
                            tipoEtapa = new {
                                e.TipoEtapa.IdTipoEtapa,
                                e.TipoEtapa.Nombre,
                                e.TipoEtapa.Descripcion,
                                e.TipoEtapa.Orden
                            }
                        }).ToList()
                })
                .ToListAsync();

            return Ok(despachos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("despacho/{id}/etapas")]
    public async Task<IActionResult> GetEtapasDespacho(int id)
    {
        try
        {
            var etapas = await _context.EtapasDespacho
                .Include(e => e.TipoEtapa)
                .Include(e => e.UsuarioResponsable)
                .Where(e => e.IdDespacho == id)
                .OrderBy(e => e.TipoEtapa.Orden)
                .Select(e => new {
                    e.IdEtapa,
                    e.IdDespacho,
                    e.IdTipoEtapa,
                    e.IdUsuarioResponsable,
                    e.Estado,
                    e.Descripcion,
                    e.FechaHora,
                    tipoEtapa = new {
                        e.TipoEtapa.IdTipoEtapa,
                        e.TipoEtapa.Nombre,
                        e.TipoEtapa.Descripcion,
                        e.TipoEtapa.Orden
                    },
                    usuarioResponsable = e.UsuarioResponsable != null ? new {
                        e.UsuarioResponsable.IdUsuario,
                        e.UsuarioResponsable.NombreCompleto,
                        e.UsuarioResponsable.Correo
                    } : null
                })
                .ToListAsync();

            return Ok(etapas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("etapa/tipos")]
    public async Task<IActionResult> GetTiposEtapas()
    {
        try
        {
            var tiposEtapas = await _context.TiposEtapa
                .OrderBy(t => t.Orden)
                .ToListAsync();

            return Ok(tiposEtapas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("despacho/{id}/etapa/{idEtapa}/estado")]
    public async Task<IActionResult> ActualizarEstadoEtapa(int id, int idEtapa, [FromBody] ActualizarEstadoRequest request)
    {
        try
        {
            var etapa = await _context.EtapasDespacho
                .Include(e => e.Despacho)
                .FirstOrDefaultAsync(e => e.IdDespacho == id && e.IdEtapa == idEtapa);

            if (etapa == null)
            {
                return NotFound(new { error = "Etapa no encontrada" });
            }

            etapa.Estado = request.Estado;
            etapa.FechaHora = DateTime.UtcNow;
            
            if (request.IdUsuarioResponsable.HasValue)
            {
                etapa.IdUsuarioResponsable = request.IdUsuarioResponsable;
            }

            await _context.SaveChangesAsync();

            // Recalcular progreso del despacho
            var totalEtapas = await _context.EtapasDespacho
                .CountAsync(e => e.IdDespacho == id);
            
            var etapasCompletadas = await _context.EtapasDespacho
                .CountAsync(e => e.IdDespacho == id && e.Estado == "Completado");

            var porcentaje = (short)((etapasCompletadas * 100) / totalEtapas);
            
            var despacho = etapa.Despacho;
            despacho.PorcentajeProgreso = porcentaje;

            await _context.SaveChangesAsync();

            return Ok(new { 
                mensaje = "Estado actualizado correctamente",
                porcentajeProgreso = porcentaje
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class ActualizarEstadoRequest
{
    public string Estado { get; set; } = string.Empty;
    public int? IdUsuarioResponsable { get; set; }
}
