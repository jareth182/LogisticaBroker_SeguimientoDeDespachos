namespace LogisticaBroker.Models;

public class DiligenciaAforo
{
    public int IdDiligencia { get; set; }
    public int IdDespacho { get; set; }
    public int IdUsuario { get; set; }
    public DateTime? FechaProgramada { get; set; }
    public string? ResultadoRevision { get; set; }
    public string? Observaciones { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
    public ICollection<FotoAforo> Fotos { get; set; } = [];
}
