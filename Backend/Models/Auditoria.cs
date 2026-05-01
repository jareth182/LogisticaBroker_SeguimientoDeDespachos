namespace LogisticaBroker.Models;

public class Auditoria
{
    public int IdAuditoria { get; set; }
    public int IdUsuario { get; set; }
    public string TablaAfectada { get; set; } = null!;
    public string Accion { get; set; } = null!;
    public string? Detalle { get; set; }
    public DateTime FechaHora { get; set; } = DateTime.UtcNow;
    public string? Ip { get; set; }

    // Navegación
    public Usuario Usuario { get; set; } = null!;
}
