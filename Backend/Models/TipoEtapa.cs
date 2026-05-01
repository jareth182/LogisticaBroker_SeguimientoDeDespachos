namespace LogisticaBroker.Models;

public class TipoEtapa
{
    public int IdTipoEtapa { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public short Orden { get; set; }

    // Navegación
    public ICollection<EtapaDespacho> Etapas { get; set; } = [];
}
