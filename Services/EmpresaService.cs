using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LogisticaBroker.Services;

public class EmpresaService
{
    private readonly AppDbContext _context;
    private readonly EmailService _emailService; // 🔹 NUEVO

    public EmpresaService(AppDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task RegistrarEmpresaAsync(Empresa empresa)
    {
        // 🔹 Validar RUC único
        if (await _context.Empresas.AnyAsync(e => e.Ruc == empresa.Ruc))
            throw new Exception("El RUC ya está registrado");

        // 🔹 Validar correo único
        if (await _context.Empresas.AnyAsync(e => e.Correo == empresa.Correo))
            throw new Exception("El correo ya está registrado");

        // 🔹 Guardar empresa
        _context.Empresas.Add(empresa);
        await _context.SaveChangesAsync();

        // 🔹 Generar contraseña temporal
        var password = Guid.NewGuid().ToString("N").Substring(0, 8);

        // 🔹 Crear usuario
        var usuario = new Usuario
        {
            NombreCompleto = empresa.NombreContacto,
            Correo = empresa.Correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(password),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1,
            Estado = "Activo"
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync(); // 🔹 genera IdUsuario

        // 🔹 Auditoría
        var auditoria = new Auditoria
        {
            TablaAfectada = "Empresa",
            Accion = "INSERT",
            FechaHora = DateTime.UtcNow,
            IdUsuario = usuario.IdUsuario
        };

        _context.Auditorias.Add(auditoria);

        await _context.SaveChangesAsync();

        //  T19: ENVIAR CORREO AUTOMÁTICO
        var html = _emailService.GenerarPlantillaBienvenida(
            usuario.NombreCompleto,
            usuario.Correo,
            password
        );

        await _emailService.EnviarCorreoAsync(
            usuario.Correo,
            "Bienvenido a LogisticaBroker 🚀",
            html
        );
    }
}