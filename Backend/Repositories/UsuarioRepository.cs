using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Repositories;

public class UsuarioRepository : Repository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext context) : base(context) { }

    public async Task<Usuario?> GetByCorreoAsync(string correo) =>
        await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Correo == correo);

    public async Task<IEnumerable<Usuario>> GetByRolAsync(int idRol) =>
        await _context.Usuarios
            .Where(u => u.IdRol == idRol)
            .ToListAsync();
}
