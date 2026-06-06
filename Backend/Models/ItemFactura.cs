namespace LogisticaBroker.Models;

public class ItemFactura
{
    public int IdItem { get; set; }
    public int IdDespacho { get; set; }
    public string Descripcion { get; set; } = null!;
    public decimal Cantidad { get; set; }
    public decimal Valor { get; set; }
    public decimal Peso { get; set; }
    public string? PartidaArancelaria { get; set; }
    public bool TieneRestriccion { get; set; } = false;
    public DateTime? FechaModificacion { get; set; }
    public string? UsuarioModificacion { get; set; }

    // Navegación
    public Despacho Despacho { get; set; } = null!;
}
