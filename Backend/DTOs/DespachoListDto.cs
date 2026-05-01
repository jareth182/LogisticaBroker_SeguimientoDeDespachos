namespace LogisticaBroker.DTOs
{
    public class DespachoListDto
    {
        public int IdDespacho { get; set; }
        public int IdEmpresa { get; set; }
        public string? Ruc { get; set; }
        public string? RazonSocial { get; set; }
        public string CodigoOrden { get; set; } = string.Empty;
        public string CodigoBl { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
    }
}
