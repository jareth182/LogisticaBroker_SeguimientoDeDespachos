namespace LogisticaBroker.Models;

public class LogisticaTransporte
{
    public int IdTransporte { get; set; }
    public int IdDespacho { get; set; }
    public string? EmpresaTransporte { get; set; }
    public string? PlacaVehiculo { get; set; }
    public string EstadoEntrega { get; set; } = "Pendiente";
    public DateTime? FechaRetiro { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string? UrlActaRecepcion { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
}
