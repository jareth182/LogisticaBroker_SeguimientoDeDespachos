namespace LogisticaBroker.Models;

public class RestriccionLegal
{
    public int IdRestriccion { get; set; }
    public string Nombre { get; set; } = null!;
    public string Entidad { get; set; } = null!;
    public string? Descripcion { get; set; }

    // Navegación
    public ICollection<DespachoRestriccion> Despachos { get; set; } = [];
}
