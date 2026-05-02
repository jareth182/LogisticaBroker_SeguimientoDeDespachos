namespace LogisticaBroker.DTOs
{
    public class CrearDespachoDto
    {
        public int IdEmpresa { get; set; } 
        public string CodigoBl { get; set; } = string.Empty;
        public DateOnly? Eta { get; set; }
        public string? Mercancia { get; set; }
    }
}