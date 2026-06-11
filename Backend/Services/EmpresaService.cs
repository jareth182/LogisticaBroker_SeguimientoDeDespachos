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
            IdRol          = 2,
            Estado         = "Activo",
            DebeActualizarContrasena = false
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        _context.ContratosServicio.Add(new ContratoServicio
        {
            IdEmpresa       = empresa.IdEmpresa,
            EstadoFirma     = "Pendiente",
            FechaGeneracion = DateTime.UtcNow,
        });
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

    public async Task EliminarEmpresaAsync(int id)
    {
        if (!await _context.Empresas.AnyAsync(e => e.IdEmpresa == id))
            throw new KeyNotFoundException("Empresa no encontrada");

        // 1. PartidaArancelaria → FK Restrict sobre Despacho, eliminar antes
        var despachoIds = await _context.Despachos
            .Where(d => d.IdEmpresa == id)
            .Select(d => d.IdDespacho)
            .ToListAsync();

        if (despachoIds.Count > 0)
            await _context.PartidasArancelarias
                .Where(p => despachoIds.Contains(p.IdDespacho))
                .ExecuteDeleteAsync();

        // 2. Documentos → FK Restrict sobre Empresa (DB cascade maneja NotificacionEmail)
        await _context.Documentos
            .Where(d => d.IdEmpresa == id)
            .ExecuteDeleteAsync();

        // 3. Despachos → FK Restrict sobre Empresa (DB cascade maneja hijos)
        await _context.Despachos
            .Where(d => d.IdEmpresa == id)
            .ExecuteDeleteAsync();

        // 4. ContratoServicio → manejar explícitamente (la DB tiene Cascade, pero lo hacemos manual para evitar tracking issues)
        await _context.ContratosServicio
            .Where(c => c.IdEmpresa == id)
            .ExecuteDeleteAsync();

        // 5. Usuarios → SetNull de IdEmpresa antes de borrar Empresa
        await _context.Usuarios
            .Where(u => u.IdEmpresa == id)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.IdEmpresa, (int?)null));

        // 6. Empresa ya sin dependencias
        await _context.Empresas
            .Where(e => e.IdEmpresa == id)
            .ExecuteDeleteAsync();
    }

    public async Task<Empresa> ActualizarEmpresaAsync(int id, Empresa datos)
    {
        var empresa = await _context.Empresas.FindAsync(id)
            ?? throw new KeyNotFoundException("Empresa no encontrada");

        empresa.RazonSocial    = datos.RazonSocial;
        empresa.NombreContacto = datos.NombreContacto;
        empresa.Correo         = datos.Correo;
        empresa.Celular        = datos.Celular;
        empresa.Direccion      = datos.Direccion;
        empresa.Estado         = datos.Estado;

        await _context.SaveChangesAsync();
        return empresa;
    }
}