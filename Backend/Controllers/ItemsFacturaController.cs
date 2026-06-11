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
                i.UnidadMedida,
                i.PaisOrigen,
                i.NumCajas,
                i.Volumen,
                i.PesoBruto,
                i.PesoNeto,
                i.PartidaArancelaria,
                i.TieneRestriccion,
                i.FechaModificacion,
                i.UsuarioModificacion
            })
            .ToListAsync();

        return Ok(items);
    }

    // POST /api/ItemsFactura/{idDespacho}/guardar
    // Agrega ítems extraídos de la factura al despacho (sin eliminar los existentes — HU10)
    [HttpPost("{idDespacho}/guardar")]
    public async Task<IActionResult> GuardarItems(int idDespacho, [FromBody] List<GuardarItemDto> items)
    {
        var despacho = await _context.Despachos.FindAsync(idDespacho);
        if (despacho is null)
            return NotFound(new { mensaje = "Despacho no encontrado." });

        var existentes = await _context.ItemsFactura
            .Where(i => i.IdDespacho == idDespacho)
            .ToListAsync();
        _context.ItemsFactura.RemoveRange(existentes);

        foreach (var dto in items)
        {
            _context.ItemsFactura.Add(new ItemFactura
            {
                IdDespacho   = idDespacho,
                Descripcion  = dto.Descripcion,
                Cantidad     = dto.Cantidad,
                Valor        = dto.Valor,
                UnidadMedida = dto.UnidadMedida,
                PaisOrigen   = dto.PaisOrigen,
                TieneRestriccion = false
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = $"{items.Count} ítems guardados correctamente." });
    }

    // PUT /api/ItemsFactura/{idItem}
    // Actualiza todos los campos editables de un ítem (HU11)
    [HttpPut("{idItem}")]
    public async Task<IActionResult> ActualizarItem(int idItem, [FromBody] ActualizarItemDto dto)
    {
        var item = await _context.ItemsFactura.FindAsync(idItem);
        if (item is null)
            return NotFound(new { mensaje = "Ítem no encontrado." });

        if (string.IsNullOrWhiteSpace(dto.PartidaArancelaria)) // PA HU11-2.1 NOK — campo de partida arancelaria vacío
            return BadRequest(new { mensaje = "El campo de partida arancelaria es obligatorio." });

        if (!System.Text.RegularExpressions.Regex.IsMatch(dto.PartidaArancelaria, @"^\d{10}$")) // PA HU11-2.2 NOK — formato inválido
            return BadRequest(new { mensaje = "La partida arancelaria debe contener únicamente caracteres numéricos con el formato oficial del arancel de aduanas." });

        if (dto.Cantidad.HasValue && dto.Cantidad.Value <= 0)
            return BadRequest(new { mensaje = "La cantidad debe ser mayor a 0." });

        if (dto.Valor.HasValue && dto.Valor.Value <= 0)
            return BadRequest(new { mensaje = "El precio unitario debe ser un valor positivo." });

        item.PartidaArancelaria  = dto.PartidaArancelaria;
        item.TieneRestriccion    = dto.TieneRestriccion;
        if (!string.IsNullOrWhiteSpace(dto.Descripcion))   item.Descripcion  = dto.Descripcion;
        if (dto.Cantidad.HasValue)    item.Cantidad     = dto.Cantidad.Value;
        if (dto.Valor.HasValue)       item.Valor        = dto.Valor.Value;
        if (dto.UnidadMedida != null) item.UnidadMedida = dto.UnidadMedida;
        if (dto.PaisOrigen   != null) item.PaisOrigen   = dto.PaisOrigen;
        if (dto.NumCajas.HasValue)    item.NumCajas     = dto.NumCajas;
        if (dto.Volumen.HasValue)     item.Volumen      = dto.Volumen;
        if (dto.PesoBruto.HasValue)   item.PesoBruto    = dto.PesoBruto;
        if (dto.PesoNeto.HasValue)    item.PesoNeto     = dto.PesoNeto;
        item.FechaModificacion   = DateTime.UtcNow;
        item.UsuarioModificacion = dto.UsuarioModificacion;

        await _context.SaveChangesAsync();

        return Ok(new // PA HU11-2 OK
        {
            item.IdItem,
            item.Descripcion,
            item.Cantidad,
            item.Valor,
            item.UnidadMedida,
            item.PaisOrigen,
            item.NumCajas,
            item.Volumen,
            item.PesoBruto,
            item.PesoNeto,
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
    public string? UnidadMedida { get; set; }
    public string? PaisOrigen { get; set; }
}

public class ActualizarItemDto
{
    public string? PartidaArancelaria { get; set; }
    public string? Descripcion { get; set; }
    public decimal? Cantidad { get; set; }
    public decimal? Valor { get; set; }
    public string? UnidadMedida { get; set; }
    public string? PaisOrigen { get; set; }
    public decimal? NumCajas { get; set; }
    public decimal? Volumen { get; set; }
    public decimal? PesoBruto { get; set; }
    public decimal? PesoNeto { get; set; }
    public bool TieneRestriccion { get; set; }
    public string? UsuarioModificacion { get; set; }
}
