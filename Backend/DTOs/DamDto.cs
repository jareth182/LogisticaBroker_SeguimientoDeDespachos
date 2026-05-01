using System.ComponentModel.DataAnnotations;

namespace LogisticaBroker.DTOs;

// DTO para CREAR una DAM (lo que llega del frontend)
public class CrearDamDto
{
    [Required(ErrorMessage = "El despacho es obligatorio")]
    public int IdDespacho { get; set; }

    [Required(ErrorMessage = "El usuario creador es obligatorio")]
    public int IdUsuarioCreador { get; set; }

    // Pestaña: Datos Generales
    public string? ImportadorExportador { get; set; }
    public string? CodDocIdentificacion { get; set; }
    public string? DireccionImportador { get; set; }
    public string? EmpresaTransporte { get; set; }
    public string? ViaTransporte { get; set; } = "Marítimo";
    public string? PuertoEmbarque { get; set; }
    public string? TerminalAlmacenamiento { get; set; }

    // Pestaña: Valores Aduaneros
    [Range(0, double.MaxValue, ErrorMessage = "El valor FOB no puede ser negativo")]
    public decimal ValorFob { get; set; } = 0;

    [Range(0, double.MaxValue, ErrorMessage = "El flete no puede ser negativo")]
    public decimal Flete { get; set; } = 0;

    [Range(0, double.MaxValue, ErrorMessage = "El seguro no puede ser negativo")]
    public decimal Seguro { get; set; } = 0;

    [Range(0, double.MaxValue, ErrorMessage = "Los ajustes no pueden ser negativos")]
    public decimal TotalAjustes { get; set; } = 0;
}

// DTO para RESPONDER al frontend
public class DamResponseDto
{
    public int IdDam { get; set; }
    public int IdDespacho { get; set; }
    public string? ImportadorExportador { get; set; }
    public string? CodDocIdentificacion { get; set; }
    public string? DireccionImportador { get; set; }
    public string? EmpresaTransporte { get; set; }
    public string? ViaTransporte { get; set; }
    public string? PuertoEmbarque { get; set; }
    public string? TerminalAlmacenamiento { get; set; }
    public decimal ValorFob { get; set; }
    public decimal Flete { get; set; }
    public decimal Seguro { get; set; }
    public decimal TotalAjustes { get; set; }
    public decimal ValorCifTotal { get; set; }
    public string? Estado { get; set; }
    public bool EdicionBloqueada { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaFinalizacion { get; set; }
}
