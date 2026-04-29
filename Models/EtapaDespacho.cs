namespace LogisticaBroker.Models;

public class EtapaDespacho
{
    public int IdEtapa { get; set; }
    public int IdDespacho { get; set; }
    public int IdTipoEtapa { get; set; }
    public int? IdUsuarioResponsable { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public string? Descripcion { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public TipoEtapa TipoEtapa { get; set; } = null!;
    public Usuario? UsuarioResponsable { get; set; }
}
