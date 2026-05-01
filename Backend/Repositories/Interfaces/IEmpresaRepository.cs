using LogisticaBroker.Models;

namespace LogisticaBroker.Repositories.Interfaces;

public interface IEmpresaRepository : IRepository<Empresa>
{
    Task<Empresa?> GetByRucAsync(string ruc);
    Task<Empresa?> GetByCorreoAsync(string correo);
    Task<bool> ExisteRucAsync(string ruc);
    Task<IEnumerable<Empresa>> BuscarPorRucORazonSocialAsync(string termino);
}
