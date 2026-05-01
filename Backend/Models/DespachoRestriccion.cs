namespace LogisticaBroker.Models;

public class DespachoRestriccion
{
    public int IdDespacho { get; set; }
    public int IdRestriccion { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public DateTime? FechaAprobacion { get; set; }
    public string? Observaciones { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public RestriccionLegal Restriccion { get; set; } = null!;
}
