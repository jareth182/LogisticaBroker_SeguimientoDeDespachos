using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Services;

public class DespachoService
{
    private readonly AppDbContext _context;

    public DespachoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Despacho> CrearDespachoAsync(Despacho despacho)
    {
        // Generar código de despacho único
        despacho.CodigoOrden = await GenerarCodigoOrdenAsync();
        despacho.FechaCreacion = DateTime.UtcNow;
        despacho.Estado = "Borrador";

        _context.Despachos.Add(despacho);
        await _context.SaveChangesAsync();

        return despacho;
    }

    public async Task<Despacho> ObtenerDespachoAsync(int id)
    {
        var despacho = await _context.Despachos.FindAsync(id);
        if (despacho == null)
        {
            throw new KeyNotFoundException($"Despacho con ID {id} no encontrado");
        }
        return despacho;
    }

    public async Task<List<Despacho>> ListarDespachosAsync()
    {
        return await _context.Despachos
            .OrderByDescending(d => d.FechaCreacion)
            .ToListAsync();
    }

    private async Task<string> GenerarCodigoOrdenAsync()
    {
        // TODO: Implementar lógica real de generación de número
        var año = DateTime.UtcNow.Year;
        var correlativo = new Random().Next(1000, 9999);
        return $"DSP-{año}-{correlativo}";
    }
}
