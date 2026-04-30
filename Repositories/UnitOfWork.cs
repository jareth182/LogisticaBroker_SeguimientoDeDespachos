using LogisticaBroker.Data;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IDespachoRepository           Despachos { get; }
    public IDamRepository                Dams      { get; }
    public IPartidaArancelariaRepository Partidas  { get; }
    public IEmpresaRepository            Empresas  { get; }
    public IUsuarioRepository            Usuarios  { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context  = context;
        Despachos = new DespachoRepository(context);
        Dams      = new DamRepository(context);
        Partidas  = new PartidaArancelariaRepository(context);
        Empresas  = new EmpresaRepository(context);
        Usuarios  = new UsuarioRepository(context);
    }

    public async Task<int> SaveChangesAsync() =>
        await _context.SaveChangesAsync();

    public void Dispose() =>
        _context.Dispose();
}
