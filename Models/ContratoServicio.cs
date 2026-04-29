namespace LogisticaBroker.Models;

public class ContratoServicio
{
    public int IdContrato { get; set; }
    public int IdEmpresa { get; set; }
    public string Titulo { get; set; } = "Acuerdo de Servicios Logísticos y Mandato Electrónico";
    public string Version { get; set; } = "1.0";
    public string EstadoFirma { get; set; } = "Pendiente";
    public string? UrlDocumento { get; set; }
    public string? TokenFirma { get; set; }
    public bool EdicionBloqueada { get; set; } = false;
    public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFirma { get; set; }

    // Navegación
    public Empresa Empresa { get; set; } = null!;
}
