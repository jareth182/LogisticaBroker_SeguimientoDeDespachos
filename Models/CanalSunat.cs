namespace LogisticaBroker.Models;

public class CanalSunat
{
    public int IdCanal { get; set; }
    public string NombreCanal { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string? ColorHex { get; set; }

    // Navegación
    public ICollection<Despacho> Despachos { get; set; } = [];
}
