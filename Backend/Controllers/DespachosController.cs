using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<ActionResult<IEnumerable<EmpresaBusquedaDto>>> BuscarClientes(
            [FromQuery] string termino,
            [FromQuery] bool soloFirmados = false)
        {
            if (string.IsNullOrWhiteSpace(termino))
                return BadRequest(new { mensaje = "El término de búsqueda es requerido." });

            var empresas = soloFirmados
                ? await _empresaRepository.BuscarConContratoFirmadoAsync(termino)
                : await _empresaRepository.BuscarPorRucORazonSocialAsync(termino);

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

            var idsConItemsList = await _context.ItemsFactura
                .Select(i => i.IdDespacho)
                .Distinct()
                .ToListAsync();
            var idsConItems = new HashSet<int>(idsConItemsList);

            var resultado = despachos.Select(d => new DespachoListDto
            {
                IdDespacho         = d.IdDespacho,
                IdEmpresa          = d.IdEmpresa,
                Ruc                = d.Empresa?.Ruc,
                RazonSocial        = d.Empresa?.RazonSocial,
                CodigoOrden        = d.CodigoOrden ?? string.Empty,
                CodigoBl           = d.CodigoBl ?? string.Empty,
                Estado             = d.Estado ?? string.Empty,
                FechaCreacion      = d.FechaCreacion,
                Eta                = d.Eta,
                NombreCanal        = d.Canal?.NombreCanal,
                TieneItemsFactura  = idsConItems.Contains(d.IdDespacho)
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
                Estado = "Aperturado", // Sobrescribe el valor por defecto "En proceso" del modelo
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

        // PATCH: api/Despachos/{id}/estado — actualiza el estado del despacho (HU12)
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoDto dto)
        {
            var despacho = await _despachoRepository.GetByIdAsync(id);
            if (despacho == null)
                return NotFound(new { mensaje = "Despacho no encontrado." });

            if (string.IsNullOrWhiteSpace(dto.Estado))
                return BadRequest(new { mensaje = "El estado no puede estar vacío." });

            despacho.Estado = dto.Estado;
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { mensaje = $"Estado actualizado a '{dto.Estado}'.", estado = despacho.Estado });
        }

        // PATCH: api/Despachos/{id}/numeracion — registra numeración DAM y canal SUNAT (HU16)
        [HttpPatch("{id}/numeracion")]
        public async Task<IActionResult> RegistrarNumeracion(int id, [FromBody] RegistrarNumeracionDto dto)
        {
            var despacho = await _context.Despachos.FindAsync(id);
            if (despacho == null)
                return NotFound(new { mensaje = "Despacho no encontrado." });

            if (string.IsNullOrWhiteSpace(dto.Canal))
                return BadRequest(new { mensaje = "El canal es requerido." });

            var nombresValidos = new[] { "Verde", "Naranja", "Rojo" };
            if (!nombresValidos.Contains(dto.Canal))
                return BadRequest(new { mensaje = "Canal inválido. Use Verde, Naranja o Rojo." });

            var canal = await _context.CanalesSunat.FirstOrDefaultAsync(c => c.NombreCanal == dto.Canal);
            if (canal == null)
            {
                canal = new CanalSunat { NombreCanal = dto.Canal };
                _context.CanalesSunat.Add(canal);
                await _context.SaveChangesAsync();
            }

            despacho.IdCanal = canal.IdCanal;
            despacho.Estado  = $"Canal {dto.Canal}";
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje      = "Numeración registrada correctamente.",
                canal        = dto.Canal,
                estadoNuevo  = despacho.Estado,
                idCanal      = canal.IdCanal
            });
        }

        // DELETE: api/Despachos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarDespacho(int id)
        {
            var despacho = await _context.Despachos.FindAsync(id);
            if (despacho == null)
                return NotFound(new { mensaje = "Despacho no encontrado." });

            // 1. PartidasArancelarias → FK Restrict sobre Despacho, eliminar primero
            await _context.PartidasArancelarias
                .Where(p => p.IdDespacho == id)
                .ExecuteDeleteAsync();

            // 2. Despacho (DB cascade maneja EtapasDespacho, DiligenciaAforo, Dam, Comprobantes, etc.)
            await _context.Despachos
                .Where(d => d.IdDespacho == id)
                .ExecuteDeleteAsync();

            return Ok(new { mensaje = "Despacho eliminado correctamente." });
        }

        // PUT: api/Despachos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarDespacho(int id, [FromBody] ActualizarDespachoDto dto)
        {
            var despacho = await _context.Despachos.FindAsync(id);
            if (despacho == null)
                return NotFound(new { mensaje = "Despacho no encontrado." });

            if (despacho.CodigoBl != dto.CodigoBl)
            {
                var existe = await _context.Despachos
                    .AnyAsync(d => d.CodigoBl == dto.CodigoBl && d.IdDespacho != id);
                if (existe)
                    return BadRequest(new { mensaje = "Ya existe un despacho con este número de Bill of Lading." });
            }

            despacho.IdEmpresa = dto.IdEmpresa;
            despacho.CodigoBl  = dto.CodigoBl;
            await _context.SaveChangesAsync();

            var empresa = await _context.Empresas.FindAsync(despacho.IdEmpresa);
            return Ok(new
            {
                mensaje     = "Despacho actualizado correctamente.",
                codigoOrden = despacho.CodigoOrden,
                estado      = despacho.Estado,
                codigoBl    = despacho.CodigoBl,
                razonSocial = empresa?.RazonSocial,
                ruc         = empresa?.Ruc,
                idDespacho  = despacho.IdDespacho
            });
        }
    }

    public class ActualizarEstadoDto
    {
        public string Estado { get; set; } = null!;
    }

    public class ActualizarDespachoDto
    {
        public int IdEmpresa { get; set; }
        public string CodigoBl { get; set; } = null!;
    }

    public class RegistrarNumeracionDto
    {
        public string? NumeracionDam { get; set; }
        public string Canal { get; set; } = null!;
    }
}