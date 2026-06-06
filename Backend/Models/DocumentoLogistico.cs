namespace LogisticaBroker.Models;

public class DocumentoLogistico
{
    public int IdDocumentoLogistico { get; set; }
    public int IdDespacho { get; set; }
    public string TipoDocumento { get; set; } = null!;
    public string NombreArchivo { get; set; } = null!;
    public string RutaArchivo { get; set; } = null!;
    public long TamanoBytes { get; set; }
    public DateTime FechaCarga { get; set; } = DateTime.UtcNow;
    public int IdUsuarioCargador { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public Usuario UsuarioCargador { get; set; } = null!;
}
