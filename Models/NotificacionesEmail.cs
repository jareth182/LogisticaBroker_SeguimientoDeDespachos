namespace LogisticaBroker.Models;

public class NotificacionEmail
{
    public int IdNotificacion { get; set; }
    public int IdDocumento { get; set; }
    public int IdUsuarioEmisor { get; set; }
    public string CorreoDestino { get; set; } = null!;
    public string Asunto { get; set; } = null!;
    public string? Mensaje { get; set; }
    public string? PlantillaUsada { get; set; }
    public string EstadoEnvio { get; set; } = "Enviado";
    public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;

    // Navegación
    public Documento Documento { get; set; } = null!;
    public Usuario UsuarioEmisor { get; set; } = null!;
}
