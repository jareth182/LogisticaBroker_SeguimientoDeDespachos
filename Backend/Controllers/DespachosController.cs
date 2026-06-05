using Microsoft.AspNetCore.Mvc;
using LogisticaBroker.DTOs;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;
using LogisticaBroker.Data;
namespace LogisticaBroker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DespachosController : ControllerBase
    {
        private readonly IDespachoRepository _despachoRepository;
        private readonly IEmpresaRepository _empresaRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly AppDbContext _context;
        // Inyección de dependencias
        public DespachosController(
            IDespachoRepository despachoRepository, 
            IEmpresaRepository empresaRepository,
            IUnitOfWork unitOfWork,
            AppDbContext context)  
        {
            _despachoRepository = despachoRepository;
            _empresaRepository = empresaRepository;
            _unitOfWork = unitOfWork;
            _context  = context;
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

        // GET: api/Despachos — listar despachos recientes (filtro opcional por empresa para rol Cliente)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DespachoListDto>>> ObtenerDespachos([FromQuery] int? idEmpresa = null)
        {
            var despachos = await _despachoRepository.GetAllWithEmpresaAsync();

            if (idEmpresa.HasValue)
                despachos = despachos.Where(d => d.IdEmpresa == idEmpresa.Value);

            var resultado = despachos.Select(d => new DespachoListDto
            {
                IdDespacho    = d.IdDespacho,
                IdEmpresa     = d.IdEmpresa,
                Ruc           = d.Empresa?.Ruc,
                RazonSocial   = d.Empresa?.RazonSocial,
                CodigoOrden   = d.CodigoOrden,
                CodigoBl      = d.CodigoBl,
                Estado        = d.Estado,
                FechaCreacion = d.FechaCreacion,
                Eta           = d.Eta,
                NombreCanal   = d.Canal?.NombreCanal
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

            var empresa = await _empresaRepository.GetByIdAsync(dto.IdEmpresa);

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
                Eta = dto.Eta,
                Mercancia = dto.Mercancia,
                Estado = "En Apertura", // Sobrescribe el valor por defecto "En proceso" del modelo
                FechaCreacion = DateTime.UtcNow
            };

            // Guarda la entidad en la base de datos usando el patrón repositorio y unidad de trabajo
            await _despachoRepository.AddAsync(nuevoDespacho);
            await _unitOfWork.SaveChangesAsync(); 
            _context.EtapasDespacho.Add(new EtapaDespacho
            {
                IdDespacho  = nuevoDespacho.IdDespacho,
                IdTipoEtapa = 1,
                Estado      = "Finalizado",
                Descripcion = "Despacho creado correctamente",
                FechaHora   = DateTime.UtcNow
            });
            await _unitOfWork.SaveChangesAsync();

            return Ok(new
            {
                mensaje      = "Expediente aperturado exitosamente",
                codigoOrden  = nuevoDespacho.CodigoOrden,
                estado       = nuevoDespacho.Estado,
                codigoBl     = nuevoDespacho.CodigoBl,
                fechaCreacion = nuevoDespacho.FechaCreacion,
                eta          = nuevoDespacho.Eta,
                razonSocial  = empresa?.RazonSocial,
                ruc          = empresa?.Ruc
            });
        }

        // DELETE: api/Despachos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarDespacho(int id)
        {
            var despacho = await _despachoRepository.GetByIdAsync(id);
            if (despacho == null)
                return NotFound(new { mensaje = "Despacho no encontrado." });

            if (despacho.Estado == "Liquidación Terminada")
                return BadRequest(new { mensaje = "No se puede eliminar un despacho con DAM finalizada." });

            _despachoRepository.Delete(despacho);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { mensaje = $"Despacho {despacho.CodigoOrden} eliminado correctamente." });
        }
    }
}