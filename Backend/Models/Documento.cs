namespace LogisticaBroker.Models;

public class Documento
{
    public int IdDocumento { get; set; }
    public int IdEmpresa { get; set; }
    public int IdTipoDoc { get; set; }
    public int IdUsuarioCargador { get; set; }
    public int? IdUsuarioValidador { get; set; }
    public string Nombre { get; set; } = null!;
    public string RutaArchivo { get; set; } = null!;
    public string Estado { get; set; } = "Pendiente";
    public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
    public DateTime? FechaValidacion { get; set; }

    // Navegación
    public Empresa Empresa { get; set; } = null!;
    public TipoDocumento TipoDocumento { get; set; } = null!;
    public Usuario UsuarioCargador { get; set; } = null!;
    public Usuario? UsuarioValidador { get; set; }
    public ICollection<NotificacionEmail> Notificaciones { get; set; } = [];
}
