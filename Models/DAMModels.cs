namespace LogisticaBroker.Models;

public class DAMRequest
{
    public int DespachoId { get; set; }
    public List<ItemMercancia> Items { get; set; } = new();
    public string Exportador { get; set; } = string.Empty;
    public string Importador { get; set; } = string.Empty;
    public string PaisDestino { get; set; } = string.Empty;
    public string PaisOrigen { get; set; } = string.Empty;
    public string Incoterm { get; set; } = string.Empty;
    public string CondicionVenta { get; set; } = string.Empty;
    public string Transporte { get; set; } = string.Empty;
    public string PuertoEmbarque { get; set; } = string.Empty;
    public string PuertoDestino { get; set; } = string.Empty;
}

public class ItemMercancia
{
    public int Id { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string PartidaArancelaria { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal ValorUnitario { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal PesoNeto { get; set; }
    public decimal PesoBruto { get; set; }
}

public class DAMResponse
{
    public int DAMId { get; set; }
    public string NumeroDAM { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaGeneracion { get; set; }
    public string UrlDocumento { get; set; } = string.Empty;
    public List<string> Validaciones { get; set; } = new();
}
