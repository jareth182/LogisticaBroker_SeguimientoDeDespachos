namespace LogisticaBroker.Models;

public class EventoTrazabilidad
{
    public int Id { get; set; }
    public int DespachoId { get; set; }
    public string TipoEvento { get; set; } = string.Empty; // Creación, Actualización, Documento, Notificación
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaEvento { get; set; }
    public string UsuarioResponsable { get; set; } = string.Empty;
    public string DatosAdicionales { get; set; } = string.Empty; // JSON con datos extra
}

public class TrazabilidadDespacho
{
    public int DespachoId { get; set; }
    public string NumeroDespacho { get; set; } = string.Empty;
    public string EstadoActual { get; set; } = string.Empty;
    public DateTime UltimaActualizacion { get; set; }
    public List<EventoTrazabilidad> Eventos { get; set; } = new();
    public TimeSpan TiempoProcesamiento { get; set; }
    public List<string> DocumentosAsociados { get; set; } = new();
}

public class DashboardTrazabilidad
{
    public int TotalDespachos { get; set; }
    public int DespachosEnProceso { get; set; }
    public int DespachosFinalizados { get; set; }
    public int DespachosConAlertas { get; set; }
    public List<DespachoReciente> DespachosRecientes { get; set; } = new();
    public List<EventoReciente> EventosRecientes { get; set; } = new();
    public Dictionary<string, int> DespachosPorEstado { get; set; } = new();
    public Dictionary<string, int> DespachosPorDia { get; set; } = new();
}

public class DespachoReciente
{
    public int Id { get; set; }
    public string NumeroDespacho { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime UltimaActualizacion { get; set; }
    public string Cliente { get; set; } = string.Empty;
}

public class EventoReciente
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaEvento { get; set; }
    public string TipoEvento { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
}
