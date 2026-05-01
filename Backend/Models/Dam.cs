namespace LogisticaBroker.Models;

public class Dam
{
    public int IdDam { get; set; }
    public int IdDespacho { get; set; }
    public int IdUsuarioCreador { get; set; }
    public string? ImportadorExportador { get; set; }
    public string? CodDocIdentificacion { get; set; }
    public string? DireccionImportador { get; set; }
    public string? EmpresaTransporte { get; set; }
    public string ViaTransporte { get; set; } = "Marítimo";
    public string? PuertoEmbarque { get; set; }
    public string? TerminalAlmacenamiento { get; set; }
    public decimal ValorFob { get; set; } = 0;
    public decimal Flete { get; set; } = 0;
    public decimal Seguro { get; set; } = 0;
    public decimal TotalAjustes { get; set; } = 0;
    public decimal ValorCifTotal => ValorFob + Flete + Seguro + TotalAjustes;
    public string Estado { get; set; } = "Borrador";
    public bool EdicionBloqueada { get; set; } = false;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFinalizacion { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
    public Usuario UsuarioCreador { get; set; } = null!;
    public ICollection<PartidaArancelaria> Partidas { get; set; } = [];
}
