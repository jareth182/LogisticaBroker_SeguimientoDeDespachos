using LogisticaBroker.Models;

namespace LogisticaBroker.Services;

public class PartidaArancelariaService
{
    private readonly AppDbContext _context;

    public PartidaArancelariaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AsignacionResponse> AsignarPartidaAsync(AsignacionPartidaRequest request)
    {
        // Buscar la partida arancelaria
        var partida = await BuscarPartidaArancelariaAsync(request.CodigoPartida);
        
        var response = new AsignacionResponse
        {
            Exitosa = true,
            Mensaje = "Partida arancelaria asignada correctamente",
            PartidaAsignada = partida,
            Alertas = new List<string>(),
            Recomendaciones = new List<string>()
        };

        // Validaciones y recomendaciones
        if (partida.PorcentajeArancel > 20)
        {
            response.Alertas.Add("Esta partida tiene un arancel alto (>20%)");
        }

        if (string.IsNullOrEmpty(request.Justificacion))
        {
            response.Recomendaciones.Add("Agregar justificación detallada para la asignación");
        }

        // TODO: Guardar en base de datos
        // var asignacion = new PartidaDespacho
        // {
        //     DespachoId = request.DespachoId,
        //     ItemMercanciaId = request.ItemMercanciaId,
        //     CodigoPartida = request.CodigoPartida,
        //     // ... otras propiedades
        // };
        // _context.PartidasDespacho.Add(asignacion);
        // await _context.SaveChangesAsync();

        return response;
    }

    public async Task<PartidaArancelaria> BuscarPartidaAsync(string codigo)
    {
        var partida = await BuscarPartidaArancelariaAsync(codigo);
        return partida;
    }

    public async Task<List<PartidaDespacho>> ObtenerPartidasDespachoAsync(int id)
    {
        // TODO: Implementar lógica real con base de datos
        await Task.CompletedTask;
        
        return new List<PartidaDespacho>
        {
            new()
            {
                Id = 1,
                DespachoId = id,
                ItemMercanciaId = 1,
                CodigoPartida = "8471.30.00.00",
                DescripcionPartida = "Máquinas automáticas para procesamiento de datos",
                PorcentajeArancel = 0,
                FechaAsignacion = DateTime.UtcNow,
                AsignadoPor = "Jareth",
                Estado = "Confirmado"
            }
        };
    }

    private async Task<PartidaArancelaria> BuscarPartidaArancelariaAsync(string codigo)
    {
        // TODO: Implementar búsqueda real en base de datos o API externa
        await Task.CompletedTask;
        
        // Simulación de búsqueda
        var partidasSimuladas = new Dictionary<string, PartidaArancelaria>
        {
            ["8471.30.00.00"] = new PartidaArancelaria
            {
                Codigo = "8471.30.00.00",
                Descripcion = "Máquinas automáticas para procesamiento de datos",
                PorcentajeArancel = 0,
                Categoria = "Equipos de cómputo",
                Subcategoria = "Computadoras",
                Sinonimos = new List<string> { "computadoras", "equipos de procesamiento", "hardware" },
                NotasExplicativas = "Incluye computadoras personales, servidores y equipos periféricos"
            },
            ["8517.12.00.00"] = new PartidaArancelaria
            {
                Codigo = "8517.12.00.00",
                Descripcion = "Teléfonos celulares y otros aparatos de red inalámbrica",
                PorcentajeArancel = 15,
                Categoria = "Equipos de comunicación",
                Subcategoria = "Telefonía móvil",
                Sinonimos = new List<string> { "smartphones", "teléfonos móviles", "celulares" },
                NotasExplicativas = "Incluye smartphones y otros dispositivos móviles con conexión a redes"
            }
        };

        if (partidasSimuladas.TryGetValue(codigo, out var partida))
        {
            return partida;
        }

        throw new KeyNotFoundException($"Partida arancelaria con código {codigo} no encontrada");
    }
}
