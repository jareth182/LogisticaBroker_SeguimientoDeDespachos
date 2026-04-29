namespace LogisticaBroker.Models;

public class TipoDocumento
{
    public int IdTipoDoc { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    // Navegación
    public ICollection<Documento> Documentos { get; set; } = [];
}
