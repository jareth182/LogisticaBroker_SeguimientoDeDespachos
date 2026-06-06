using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsFacturaController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsFacturaController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/ItemsFactura/{idDespacho}
    [HttpGet("{idDespacho}")]
    public async Task<IActionResult> ObtenerPorDespacho(int idDespacho)
    {
        var items = await _context.ItemsFactura
            .Where(i => i.IdDespacho == idDespacho)
            .OrderBy(i => i.IdItem)
            .Select(i => new
            {
                i.IdItem,
                i.Descripcion,
                i.Cantidad,
                i.Valor,
                i.Peso,
                i.PartidaArancelaria,
                i.TieneRestriccion,
                i.FechaModificacion,
                i.UsuarioModificacion
            })
            .ToListAsync();

        return Ok(items);
    }

    // POST /api/ItemsFactura/{idDespacho}/guardar
    // Guarda (reemplaza) todos los ítems de un despacho desde HU10
    [HttpPost("{idDespacho}/guardar")]
    public async Task<IActionResult> GuardarItems(int idDespacho, [FromBody] List<GuardarItemDto> items)
    {
        var despacho = await _context.Despachos.FindAsync(idDespacho);
        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado." });

        // Eliminar ítems anteriores del despacho (reemplaza toda la extracción)
        var anteriores = await _context.ItemsFactura
            .Where(i => i.IdDespacho == idDespacho)
            .ToListAsync();
        _context.ItemsFactura.RemoveRange(anteriores);

        foreach (var dto in items)
        {
            _context.ItemsFactura.Add(new ItemFactura
            {
                IdDespacho   = idDespacho,
                Descripcion  = dto.Descripcion,
                Cantidad     = dto.Cantidad,
                Valor        = dto.Valor,
                Peso         = dto.Peso,
                TieneRestriccion = false
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = $"{items.Count} ítems guardados correctamente." });
    }

    // PUT /api/ItemsFactura/{idItem}
    // Actualiza partida arancelaria y restricciones de un ítem (HU11)
    [HttpPut("{idItem}")]
    public async Task<IActionResult> ActualizarItem(int idItem, [FromBody] ActualizarItemDto dto)
    {
        var item = await _context.ItemsFactura.FindAsync(idItem);
        if (item is null)
            return NotFound(new { mensaje = "Ítem no encontrado." });

        if (string.IsNullOrWhiteSpace(dto.PartidaArancelaria)) // PA HU11-2.1 NOK — campo de partida arancelaria vacío
            return BadRequest(new { mensaje = "El campo de partida arancelaria es obligatorio." });

        if (dto.TieneRestriccion && string.IsNullOrWhiteSpace(dto.PartidaArancelaria)) // PA HU11-3.1 NOK — restricción marcada sin partida (dead branch: capturado arriba)
            return BadRequest(new { mensaje = "Debe completar la partida arancelaria antes de registrar restricciones técnicas." });

        if (!System.Text.RegularExpressions.Regex.IsMatch(dto.PartidaArancelaria, @"^\d{10}$")) // PA HU11-2.2 NOK — formato inválido (no son 10 dígitos numéricos)
            return BadRequest(new { mensaje = "La partida arancelaria debe contener únicamente caracteres numéricos con el formato oficial del arancel de aduanas." });

        item.PartidaArancelaria  = dto.PartidaArancelaria;
        item.TieneRestriccion    = dto.TieneRestriccion;
        item.FechaModificacion   = DateTime.UtcNow;
        item.UsuarioModificacion = dto.UsuarioModificacion;

        await _context.SaveChangesAsync();

        return Ok(new // PA HU11-2 OK — partida arancelaria guardada; PA HU11-3 OK — con indicador de restricción técnica
        {
            item.IdItem,
            item.Descripcion,
            item.PartidaArancelaria,
            item.TieneRestriccion,
            item.FechaModificacion,
            item.UsuarioModificacion
        });
    }
}

public class GuardarItemDto
{
    public string Descripcion { get; set; } = null!;
    public decimal Cantidad { get; set; }
    public decimal Valor { get; set; }
    public decimal Peso { get; set; }
}

public class ActualizarItemDto
{
    public string? PartidaArancelaria { get; set; }
    public bool TieneRestriccion { get; set; }
    public string? UsuarioModificacion { get; set; }
}
