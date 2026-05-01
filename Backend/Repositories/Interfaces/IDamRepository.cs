using LogisticaBroker.Models;

namespace LogisticaBroker.Repositories.Interfaces;

public interface IDamRepository : IRepository<Dam>
{
    Task<Dam?> GetByDespachoAsync(int idDespacho);
    Task<Dam?> GetDamConPartidasAsync(int idDam);
}
