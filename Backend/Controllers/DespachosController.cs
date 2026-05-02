using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;

namespace LogisticaBroker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DespachosController : ControllerBase
    {
        private readonly IDespachoRepository _despachoRepository;
        private readonly IEmpresaRepository _empresaRepository;
        private readonly IUnitOfWork _unitOfWork;

        // Inyección de dependencias
        public DespachosController(
            IDespachoRepository despachoRepository, 
            IEmpresaRepository empresaRepository,
            IUnitOfWork unitOfWork)
        {
            _despachoRepository = despachoRepository;
            _empresaRepository = empresaRepository;
            _unitOfWork = unitOfWork;
        }

        // T30: Desarrollar endpoint GET para listar clientes afiliados activos
        [HttpGet("clientes/buscar")]
        public async Task<ActionResult<IEnumerable<EmpresaBusquedaDto>>> BuscarClientes([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino)) 
                return BadRequest(new { mensaje = "El término de búsqueda es requerido." });

            var empresas = await _empresaRepository.BuscarPorRucORazonSocialAsync(termino);
            
            var resultado = empresas.Select(e => new EmpresaBusquedaDto
            {
                IdEmpresa = e.IdEmpresa,
                Ruc = e.Ruc,
                RazonSocial = e.RazonSocial
            });

            return Ok(resultado);
        }

        // GET: api/Despachos — listar despachos recientes con datos del importador
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DespachoListDto>>> ObtenerDespachos()
        {
            var despachos = await _despachoRepository.GetAllWithEmpresaAsync();

            var resultado = despachos.Select(d => new DespachoListDto
            {
                IdDespacho = d.IdDespacho,
                IdEmpresa = d.IdEmpresa,
                Ruc = d.Empresa?.Ruc,
                RazonSocial = d.Empresa?.RazonSocial,
                CodigoOrden = d.CodigoOrden,
                CodigoBl = d.CodigoBl,
                Estado = d.Estado,
                FechaCreacion = d.FechaCreacion
            });

            return Ok(resultado);
        }

        // T31: Desarrollar endpoint POST para registrar la apertura del despacho
        [HttpPost]
        public async Task<IActionResult> CrearDespacho([FromBody] CrearDespachoDto dto)
        {
            // T32: Implementar validación de unicidad en BD para el número de Bill of Lading
            var despachoExistente = await _despachoRepository.GetByCodigoBlAsync(dto.CodigoBl);
            if (despachoExistente != null)
            {
                return BadRequest(new { mensaje = "Ya existe un despacho activo con este número de Bill of Lading." });
            }

            // T33: Autogenerar código secuencial de seguimiento interno
            var ultimoCodigo = await _despachoRepository.ObtenerUltimoCodigoOrdenAsync();
            int siguienteNumero = 1;
            
            if (!string.IsNullOrEmpty(ultimoCodigo) && ultimoCodigo.StartsWith("ORD-"))
            {
                if (int.TryParse(ultimoCodigo.Substring(4), out int numero))
                {
                    siguienteNumero = numero + 1;
                }
            }
            string nuevoCodigo = $"ORD-{siguienteNumero:D3}";

            // Criterio de Aceptación 2: Asignar código único y definir estado inicial "En Apertura"
            var nuevoDespacho = new Despacho
            {
                IdEmpresa = dto.IdEmpresa,
                CodigoBl = dto.CodigoBl,
                CodigoOrden = nuevoCodigo,
                Estado = "En Apertura", // Sobrescribe el valor por defecto "En proceso" del modelo
                FechaCreacion = DateTime.UtcNow
            };

            // Guarda la entidad en la base de datos usando el patrón repositorio y unidad de trabajo
            await _despachoRepository.AddAsync(nuevoDespacho);
            await _unitOfWork.SaveChangesAsync(); 

            // Retorna confirmación estructurada
            return Ok(new 
            { 
                mensaje = "Expediente aperturado exitosamente", 
                codigoOrden = nuevoDespacho.CodigoOrden,
                estado = nuevoDespacho.Estado
            });
        }
    }
}