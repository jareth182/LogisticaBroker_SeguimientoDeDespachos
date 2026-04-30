using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace LogisticaBroker.Services;

public class EmpresaService
{
    private readonly AppDbContext _context;

    public EmpresaService(AppDbContext context)
    {
        _context = context;
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

        // 🔹 Generar contraseña temporal (8 caracteres)
        var password = Guid.NewGuid().ToString("N").Substring(0, 8);

        // 🔹 Crear usuario
        var usuario = new Usuario
        {
            NombreCompleto = empresa.NombreContacto,
            Correo = empresa.Correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(password),
            IdEmpresa = empresa.IdEmpresa,
            IdRol = 1, // ⚠️ Debe existir en BD
            Estado = "Activo"
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync(); // ✅ IMPORTANTE: aquí se genera IdUsuario

        // 🔹 Registrar log de notificación
        var notificacion = new NotificacionEmail
        {
            CorreoDestino = empresa.Correo,
            Asunto = "Bienvenido a LogisticaBroker",
            PlantillaUsada = "Bienvenida",
            EstadoEnvio = "Pendiente"
        };

        //_context.NotificacionesEmail.Add(notificacion);

        // 🔹 Auditoría (ahora sí con usuario válido)
        var auditoria = new Auditoria
        {
            TablaAfectada = "Empresa",
            Accion = "INSERT",
            FechaHora = DateTime.UtcNow,
            IdUsuario = usuario.IdUsuario // ✅ CLAVE
        };

        _context.Auditorias.Add(auditoria);

        await _context.SaveChangesAsync();

        // 🔹 Simulación de envío de correo (async)
        _ = Task.Run(() =>
        {
            Console.WriteLine($"Correo enviado a {empresa.Correo} con clave {password}");
        });
    }
}