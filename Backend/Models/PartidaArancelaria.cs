namespace LogisticaBroker.Models;

public class PartidaArancelaria
{
    public int IdPartida { get; set; }
    public int? IdDam { get; set; }              // ← nullable ahora
    public int IdDespacho { get; set; }          // ← nuevo
    public string? PartidaNacional { get; set; }
    public string? SubpartidaNaban { get; set; }
    public int CantidadBultos { get; set; } = 0;
    public decimal PesoNetoKg { get; set; } = 0;
    public decimal PesoBrutoKg { get; set; } = 0;
    public string? DescripcionMercancias { get; set; }

    // Navegación
    public Dam? Dam { get; set; }
    public Despacho Despacho { get; set; } = null!;
}