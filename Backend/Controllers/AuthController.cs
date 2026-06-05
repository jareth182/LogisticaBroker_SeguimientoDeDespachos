using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/Auth/login — HU28
    // ─────────────────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var resultado = await _authService.LoginAsync(dto);
            return Ok(resultado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { mensaje = ex.Message });
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/Auth/recuperar-contrasena — HU Recuperar contraseña
    // ─────────────────────────────────────────────────────────
    [HttpPost("recuperar-contrasena")]
    public async Task<IActionResult> RecuperarContrasena([FromBody] RecuperarContrasenaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _authService.RecuperarContrasenaAsync(dto);
            return Ok(new { mensaje = "Si el correo está registrado, recibirás las instrucciones de recuperación." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensaje = "No se pudo enviar el correo. Intenta nuevamente." });
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/Auth/logout
    // El logout real se maneja en el frontend eliminando el token
    // ─────────────────────────────────────────────────────────
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { mensaje = "Sesión cerrada correctamente" });
    }
}
