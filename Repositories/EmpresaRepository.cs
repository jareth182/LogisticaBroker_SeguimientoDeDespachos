using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class EmpresaRepository : Repository<Empresa>, IEmpresaRepository
{
    public EmpresaRepository(AppDbContext context) : base(context) { }

    public async Task<Empresa?> GetByRucAsync(string ruc) =>
        await _context.Empresas
            .FirstOrDefaultAsync(e => e.Ruc == ruc);

    public async Task<Empresa?> GetByCorreoAsync(string correo) =>
        await _context.Empresas
            .FirstOrDefaultAsync(e => e.Correo == correo);

    public async Task<bool> ExisteRucAsync(string ruc) =>
        await _context.Empresas.AnyAsync(e => e.Ruc == ruc);
}
