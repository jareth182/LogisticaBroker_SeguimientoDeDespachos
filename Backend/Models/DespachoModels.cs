namespace LogisticaBroker.Models;

public class Despacho
{
    public int Id { get; set; }
    public string NumeroDespacho { get; set; } = string.Empty;
    public int EmpresaId { get; set; }
    public string TipoDespacho { get; set; } = string.Empty; // Importación/Exportación
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaCierre { get; set; }
    public string Estado { get; set; } = string.Empty; // Borrador, En Proceso, Finalizado, Cerrado
    public string DescripcionMercancia { get; set; } = string.Empty;
    public decimal ValorFOB { get; set; }
    public string PuertoOrigen { get; set; } = string.Empty;
    public string PuertoDestino { get; set; } = string.Empty;
    public string ClienteNombre { get; set; } = string.Empty;
    public string ClienteContacto { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
}

public class CrearDespachoRequest
{
    public int EmpresaId { get; set; }
    public string TipoDespacho { get; set; } = string.Empty;
    public string DescripcionMercancia { get; set; } = string.Empty;
    public decimal ValorFOB { get; set; }
    public string PuertoOrigen { get; set; } = string.Empty;
    public string PuertoDestino { get; set; } = string.Empty;
    public string ClienteNombre { get; set; } = string.Empty;
    public string ClienteContacto { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;
}
