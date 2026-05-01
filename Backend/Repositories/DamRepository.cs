using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class DamRepository : Repository<Dam>, IDamRepository
{
    public DamRepository(AppDbContext context) : base(context) { }

    public async Task<Dam?> GetByDespachoAsync(int idDespacho) =>
        await _context.Dams
            .FirstOrDefaultAsync(d => d.IdDespacho == idDespacho);

    public async Task<Dam?> GetDamConPartidasAsync(int idDam) =>
        await _context.Dams
            .Include(d => d.Partidas)
            .FirstOrDefaultAsync(d => d.IdDam == idDam);
}
