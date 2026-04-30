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
            await _service.RegistrarEmpresaAsync(empresa);
            return Ok(new { mensaje = "Empresa registrada correctamente 🚀" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.ToString() });
        }
    }
}