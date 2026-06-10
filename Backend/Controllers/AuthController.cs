using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Services;
using System.Security.Claims;

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
    // POST /api/Auth/cambiar-contrasena
    // ─────────────────────────────────────────────────────────
    [HttpPost("cambiar-contrasena")]
    public async Task<IActionResult> CambiarContrasena([FromBody] CambiarContrasenaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _authService.CambiarContrasenaAsync(dto);
            return Ok(new { mensaje = "Contraseña actualizada correctamente." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { mensaje = "No se pudo actualizar la contraseña. Intenta nuevamente." });
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/Auth/actualizar-contrasena — primer login post-firma
    // ─────────────────────────────────────────────────────────
    [Authorize]
    [HttpPost("actualizar-contrasena")]
    public async Task<IActionResult> ActualizarContrasena([FromBody] ActualizarContrasenaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(idClaim, out int idUsuario))
            return Unauthorized(new { mensaje = "Token inválido." });

        try
        {
            await _authService.ActualizarContrasenaAsync(idUsuario, dto.NuevaContrasena);
            return Ok(new { mensaje = "Contraseña actualizada correctamente." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
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
