using LogisticaBroker.Models;

namespace LogisticaBroker.Repositories.Interfaces;

public interface IDespachoRepository : IRepository<Despacho>
{
    Task<Despacho?> GetByCodigoBlAsync(string codigoBl);
    Task<IEnumerable<Despacho>> GetByEmpresaAsync(int idEmpresa);
    Task<IEnumerable<Despacho>> GetByEstadoAsync(string estado);
    Task<Despacho?> GetDespachoConEtapasAsync(int idDespacho);
    Task<IEnumerable<Despacho>> GetAllWithEmpresaAsync();
    Task<string?> ObtenerUltimoCodigoOrdenAsync();
}
