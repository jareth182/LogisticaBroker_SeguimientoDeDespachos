namespace LogisticaBroker.Models;

public class AsignacionPartidaRequest
{
    public int DespachoId { get; set; }
    public int ItemMercanciaId { get; set; }
    public string CodigoPartida { get; set; } = string.Empty;
    public string DescripcionPartida { get; set; } = string.Empty;
    public decimal PorcentajeArancel { get; set; }
    public string Justificacion { get; set; } = string.Empty;
}

public class PartidaArancelariaInfo
{
    public string Codigo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal PorcentajeArancel { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string Subcategoria { get; set; } = string.Empty;
    public List<string> Sinonimos { get; set; } = new();
    public string NotasExplicativas { get; set; } = string.Empty;
}

public class AsignacionResponse
{
    public bool Exitosa { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public PartidaArancelariaInfo PartidaAsignada { get; set; } = new();
    public List<string> Alertas { get; set; } = new();
    public List<string> Recomendaciones { get; set; } = new();
}

public class PartidaDespacho
{
    public int Id { get; set; }
    public int DespachoId { get; set; }
    public int ItemMercanciaId { get; set; }
    public string CodigoPartida { get; set; } = string.Empty;
    public string DescripcionPartida { get; set; } = string.Empty;
    public decimal PorcentajeArancel { get; set; }
    public DateTime FechaAsignacion { get; set; }
    public string AsignadoPor { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty; // Asignado, Revisado, Confirmado
}
