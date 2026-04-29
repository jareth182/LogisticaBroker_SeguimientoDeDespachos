namespace LogisticaBroker.Models;

public class ComprobantePago
{
    public int IdComprobante { get; set; }
    public int IdDespacho { get; set; }
    public int? IdUsuarioValidador { get; set; }
    public string RutaArchivo { get; set; } = null!;
    public string Formato { get; set; } = null!;
    public string Estado { get; set; } = "Pendiente";
    public string? MotivoRechazo { get; set; }
    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;
    public DateTime? FechaValidacion { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public Usuario? UsuarioValidador { get; set; }
}
