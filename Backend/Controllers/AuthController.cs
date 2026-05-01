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
    // POST /api/Auth/logout
    // El logout real se maneja en el frontend eliminando el token
    // ─────────────────────────────────────────────────────────
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { mensaje = "Sesión cerrada correctamente" });
    }
}
