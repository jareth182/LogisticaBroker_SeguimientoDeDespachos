namespace LogisticaBroker.Models;

public class FotoAforo
{
    public int IdFoto { get; set; }
    public int IdDiligencia { get; set; }
    public string UrlFoto { get; set; } = null!;
    public string? Descripcion { get; set; }
    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;

    // Navegación
    public DiligenciaAforo Diligencia { get; set; } = null!;
}
