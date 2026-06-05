using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class DespachoRepository : Repository<Despacho>, IDespachoRepository
{
    public DespachoRepository(AppDbContext context) : base(context) { }

    public async Task<Despacho?> GetByCodigoBlAsync(string codigoBl) =>
        await _context.Despachos
            .FirstOrDefaultAsync(d => d.CodigoBl == codigoBl);

    public async Task<IEnumerable<Despacho>> GetByEmpresaAsync(int idEmpresa) =>
        await _context.Despachos
            .Where(d => d.IdEmpresa == idEmpresa)
            .OrderByDescending(d => d.FechaCreacion)
            .ToListAsync();

    public async Task<IEnumerable<Despacho>> GetByEstadoAsync(string estado) =>
        await _context.Despachos
            .Where(d => d.Estado == estado)
            .OrderByDescending(d => d.FechaCreacion)
            .ToListAsync();

    public async Task<Despacho?> GetDespachoConEtapasAsync(int idDespacho) =>
        await _context.Despachos
            .Include(d => d.Etapas)
                .ThenInclude(e => e.TipoEtapa)
            .Include(d => d.Canal)
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);
    
    public async Task<string?> ObtenerUltimoCodigoOrdenAsync() =>
        await _context.Despachos
            .OrderByDescending(d => d.IdDespacho)
            .Select(d => d.CodigoOrden)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<Despacho>> GetAllWithEmpresaAsync() =>
        await _context.Despachos
            .Include(d => d.Empresa)
            .Include(d => d.Canal)
            .OrderByDescending(d => d.FechaCreacion)
            .ToListAsync();
}
