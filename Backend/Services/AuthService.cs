using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LogisticaBroker.Data;
using LogisticaBroker.DTOs;

namespace LogisticaBroker.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration config, EmailService emailService)
    {
        _context      = context;
        _config       = config;
        _emailService = emailService;
    }

    // ─────────────────────────────────────────────────────────
    // HU28 — Iniciar sesión
    // ─────────────────────────────────────────────────────────
    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        // 1. Buscar usuario por correo incluyendo su rol y empresa
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Correo == dto.Correo);

        // 2. Verificar que existe y que la contraseña es correcta
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.ContrasenaHash))
            throw new UnauthorizedAccessException("Correo o contraseña incorrectos");

        // 3. Verificar que el usuario esté activo
        if (usuario.Estado != "Activo")
            throw new UnauthorizedAccessException("Tu cuenta está inactiva. Contacta al administrador");

        // 4. Generar token JWT
        var token = GenerarToken(usuario.IdUsuario, usuario.Correo, usuario.Rol.NombreRol);

        return new LoginResponseDto
        {
            Token = token,
            Expiracion = DateTime.UtcNow.AddHours(8),
            Usuario = new UsuarioInfoDto
            {
                IdUsuario      = usuario.IdUsuario,
                NombreCompleto = usuario.NombreCompleto,
                Correo         = usuario.Correo,
                Rol            = usuario.Rol.NombreRol,
                IdEmpresa      = usuario.IdEmpresa,
                EstadoEmpresa  = usuario.Empresa?.Estado
            }
        };
    }

    // ─────────────────────────────────────────────────────────
    // HU — Recuperar contraseña
    // ─────────────────────────────────────────────────────────
    public async Task RecuperarContrasenaAsync(RecuperarContrasenaDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo == dto.Correo);

        // Siempre respondemos igual para no revelar si el correo existe
        if (usuario is null) return;

        var token   = Guid.NewGuid().ToString("N")[..12].ToUpper();
        var asunto  = "Recuperación de contraseña — Logística Broker";
        var html    = _emailService.GenerarPlantillaRecuperacion(usuario.NombreCompleto, usuario.Correo, token);

        await _emailService.EnviarCorreoAsync(usuario.Correo, asunto, html);
    }

    // ─────────────────────────────────────────────────────────
    // Generar token JWT
    // ─────────────────────────────────────────────────────────
    private string GenerarToken(int idUsuario, string correo, string rol)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, idUsuario.ToString()),
            new Claim(ClaimTypes.Email, correo),
            new Claim(ClaimTypes.Role, rol)
        };

        var token = new JwtSecurityToken(
            issuer:   _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims:   claims,
            expires:  DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
