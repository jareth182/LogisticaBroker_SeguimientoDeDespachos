namespace LogisticaBroker.Models;

public class Despacho
{
    public int IdDespacho { get; set; }
    public int IdEmpresa { get; set; }
    public int? IdCanal { get; set; }
    public string CodigoBl { get; set; } = null!;
    public string? CodigoOrden { get; set; }
    public string? Nave { get; set; }
    public string? Contenedor { get; set; }
    public string? Origen { get; set; }
    public string? Destino { get; set; }
    public DateOnly? Eta { get; set; }
    public string? Mercancia { get; set; }
    public short PorcentajeProgreso { get; set; } = 0;
    public string Estado { get; set; } = "En proceso";
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public Empresa Empresa { get; set; } = null!;
    public CanalSunat? Canal { get; set; }
    public Dam? Dam { get; set; }
    public LogisticaTransporte? Transporte { get; set; }
    public ICollection<EtapaDespacho> Etapas { get; set; } = [];
    public ICollection<DiligenciaAforo> Diligencias { get; set; } = [];
    public ICollection<ComprobantePago> Comprobantes { get; set; } = [];
    public ICollection<DespachoRestriccion> Restricciones { get; set; } = [];
}
