using LogisticaBroker.Models;

namespace LogisticaBroker.Repositories.Interfaces;

public interface IPartidaArancelariaRepository : IRepository<PartidaArancelaria>
{
    Task<IEnumerable<PartidaArancelaria>> GetByDamAsync(int idDam);
}
