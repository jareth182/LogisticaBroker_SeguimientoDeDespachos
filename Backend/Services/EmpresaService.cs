using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LogisticaBroker.Services;

public class EmpresaService
{
    private readonly AppDbContext _context;
    private readonly EmailService _emailService;

    public EmpresaService(AppDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<(Usuario usuario, string passwordTemporal)> RegistrarEmpresaAsync(Empresa empresa)
    {
        if (await _context.Empresas.AnyAsync(e => e.Ruc == empresa.Ruc))
            throw new Exception("El RUC ya está registrado");

        if (await _context.Empresas.AnyAsync(e => e.Correo == empresa.Correo))
            throw new Exception("El correo ya está registrado");

        _context.Empresas.Add(empresa);
        await _context.SaveChangesAsync();

        var password = Guid.NewGuid().ToString("N")[..8];

        var usuario = new Usuario
        {
            NombreCompleto = empresa.NombreContacto,
            Correo         = empresa.Correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(password),
            IdEmpresa      = empresa.IdEmpresa,
            IdRol          = 1,
            Estado         = "Activo"
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        _context.Auditorias.Add(new Auditoria
        {
            TablaAfectada = "Empresa",
            Accion        = "INSERT",
            FechaHora     = DateTime.UtcNow,
            IdUsuario     = usuario.IdUsuario
        });
        await _context.SaveChangesAsync();

        try
        {
            var html = _emailService.GenerarPlantillaBienvenida(
                usuario.NombreCompleto, usuario.Correo, password);
            await _emailService.EnviarCorreoAsync(
                usuario.Correo, "Bienvenido a LogisticaBroker 🚀", html);
        }
        catch { }

        return (usuario, password);
    }

    public async Task<List<Empresa>> ListarEmpresasAsync() =>
    await _context.Empresas
        .OrderByDescending(e => e.FechaRegistro)
        .ToListAsync();
}