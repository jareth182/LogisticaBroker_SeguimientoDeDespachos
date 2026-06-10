namespace LogisticaBroker.Models;

public class Usuario
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public int? IdEmpresa { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string ContrasenaHash { get; set; } = null!;
    public string Estado { get; set; } = "Activo";
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public string? TokenRecuperacion { get; set; }
    public DateTime? TokenExpiracionUtc { get; set; }
    public bool DebeActualizarContrasena { get; set; } = true;

    // Navegación
    public Rol Rol { get; set; } = null!;
    public Empresa? Empresa { get; set; }
    public ICollection<EtapaDespacho> EtapasResponsable { get; set; } = [];
    public ICollection<DiligenciaAforo> Diligencias { get; set; } = [];
    public ICollection<Documento> DocumentosCargados { get; set; } = [];
    public ICollection<Documento> DocumentosValidados { get; set; } = [];
    public ICollection<NotificacionEmail> NotificacionesEnviadas { get; set; } = [];
    public ICollection<Auditoria> Auditorias { get; set; } = [];
}
