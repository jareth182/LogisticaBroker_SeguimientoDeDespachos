using LogisticaBroker.Data;
using LogisticaBroker.Models;
using System.Text.Json;

namespace LogisticaBroker.Services;

public class TrazabilidadService
{
    private readonly AppDbContext _context;

    public TrazabilidadService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TrazabilidadDespacho> ObtenerTrazabilidadDespachoAsync(int id)
    {
        // TODO: Implementar lógica real con base de datos
        await Task.CompletedTask;
        
        return new TrazabilidadDespacho
        {
            DespachoId = id,
            NumeroDespacho = $"DSP-{id}",
            EstadoActual = "En Proceso",
            UltimaActualizacion = DateTime.UtcNow,
            TiempoProcesamiento = TimeSpan.FromHours(24),
            Eventos = new List<EventoTrazabilidad>
            {
                new()
                {
                    Id = 1,
                    DespachoId = id,
                    TipoEvento = "Creación",
                    Descripcion = "Despacho creado",
                    FechaEvento = DateTime.UtcNow.AddHours(-24),
                    UsuarioResponsable = "Sistema"
                },
                new()
                {
                    Id = 2,
                    DespachoId = id,
                    TipoEvento = "Actualización",
                    Descripcion = "Documentación actualizada",
                    FechaEvento = DateTime.UtcNow.AddHours(-12),
                    UsuarioResponsable = "Usuario Demo"
                }
            },
            DocumentosAsociados = new List<string> { "Factura.pdf", "Guía.pdf", "DAM.pdf" }
        };
    }

    public async Task<EventoTrazabilidad> RegistrarEventoAsync(EventoTrazabilidad evento)
    {
        evento.FechaEvento = DateTime.UtcNow;
        evento.Id = new Random().Next(1000, 9999);

        // TODO: Guardar en base de datos
        // _context.EventosTrazabilidad.Add(evento);
        // await _context.SaveChangesAsync();

        return evento;
    }

    public async Task<DashboardTrazabilidad> ObtenerDashboardAsync()
    {
        // TODO: Implementar lógica real con estadísticas de la base de datos
        await Task.CompletedTask;

        return new DashboardTrazabilidad
        {
            TotalDespachos = 150,
            DespachosEnProceso = 45,
            DespachosFinalizados = 95,
            DespachosConAlertas = 10,
            DespachosRecientes = new List<DespachoReciente>
            {
                new() { Id = 1, NumeroDespacho = "DSP-2024-1001", Estado = "En Proceso", UltimaActualizacion = DateTime.UtcNow.AddHours(-2), Cliente = "Cliente A" },
                new() { Id = 2, NumeroDespacho = "DSP-2024-1002", Estado = "Finalizado", UltimaActualizacion = DateTime.UtcNow.AddHours(-5), Cliente = "Cliente B" }
            },
            EventosRecientes = new List<EventoReciente>
            {
                new() { Id = 1, Descripcion = "DAM generada", FechaEvento = DateTime.UtcNow.AddMinutes(-30), TipoEvento = "Documento", Usuario = "Kiara" },
                new() { Id = 2, Descripcion = "Despacho creado", FechaEvento = DateTime.UtcNow.AddHours(-1), TipoEvento = "Creación", Usuario = "Jazarelly" }
            },
            DespachosPorEstado = new Dictionary<string, int>
            {
                ["Borrador"] = 10,
                ["En Proceso"] = 45,
                ["Finalizado"] = 95
            },
            DespachosPorDia = new Dictionary<string, int>
            {
                ["Lunes"] = 20,
                ["Martes"] = 25,
                ["Miércoles"] = 30,
                ["Jueves"] = 15,
                ["Viernes"] = 10
            }
        };
    }
}
