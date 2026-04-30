namespace LogisticaBroker.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IDespachoRepository          Despachos   { get; }
    IDamRepository               Dams        { get; }
    IPartidaArancelariaRepository Partidas   { get; }
    IEmpresaRepository           Empresas    { get; }
    IUsuarioRepository           Usuarios    { get; }

    Task<int> SaveChangesAsync();
}
