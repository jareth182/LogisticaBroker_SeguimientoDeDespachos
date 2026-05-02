namespace LogisticaBroker.DTOs;

public class EtapaDespachoDto
{
    public int       IdTipoEtapa { get; set; }
    public string    Nombre      { get; set; } = "";
    public int       Orden       { get; set; }
    public string    Estado      { get; set; } = "Pendiente";
    public DateTime? FechaHora   { get; set; }
}