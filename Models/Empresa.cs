namespace LogisticaBroker.Models;

public class Empresa
{
    public int IdEmpresa { get; set; }
    public string? CodigoOrden { get; set; }
    public string Ruc { get; set; } = null!;
    public string RazonSocial { get; set; } = null!;
    public string NombreContacto { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string? Celular { get; set; }
    public string? Direccion { get; set; }
    public string? Rubro { get; set; }
    public decimal? MontoItem { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public DateOnly FechaRegistro { get; set; } = DateOnly.FromDateTime(DateTime.Today);

    // Navegación
    public ContratoServicio? Contrato { get; set; }
    public ICollection<Usuario> Usuarios { get; set; } = [];
    public ICollection<Despacho> Despachos { get; set; } = [];
    public ICollection<Documento> Documentos { get; set; } = [];
}
