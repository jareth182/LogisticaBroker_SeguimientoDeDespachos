using LogisticaBroker.Models;

namespace LogisticaBroker.Repositories.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByCorreoAsync(string correo);
    Task<IEnumerable<Usuario>> GetByRolAsync(int idRol);
}
