using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.Models;
using LogisticaBroker.Services;

namespace LogisticaBroker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpresaController : ControllerBase
{
    private readonly EmpresaService _service;

    public EmpresaController(EmpresaService service)
    {
        _service = service;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar([FromBody] Empresa empresa)
    {
        try
        {
            var (usuario, password) = await _service.RegistrarEmpresaAsync(empresa);
            return Ok(new
            {
                mensaje           = "Empresa registrada correctamente",
                nombreContacto    = usuario.NombreCompleto,
                correo            = usuario.Correo,
                usuarioGenerado   = $"impac{empresa.Ruc}",
                passwordTemporal  = password,
                fechaRegistro     = empresa.FechaRegistro.ToString("dd/MM/yyyy"),
                ruc               = empresa.Ruc,
                razonSocial       = empresa.RazonSocial
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        try
        {
            var empresas = await _service.ListarEmpresasAsync();
            return Ok(empresas);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}