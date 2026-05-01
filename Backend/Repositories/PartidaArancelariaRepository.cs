using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class PartidaArancelariaRepository : Repository<PartidaArancelaria>, IPartidaArancelariaRepository
{
    public PartidaArancelariaRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PartidaArancelaria>> GetByDamAsync(int idDam) =>
        await _context.PartidasArancelarias
            .Where(p => p.IdDam == idDam)
            .ToListAsync();
}
