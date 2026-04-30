namespace LogisticaBroker.DTOs;

// DTO para CREAR una partida arancelaria (lo que llega del frontend)
public class CrearPartidaArancelariaDto
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "La partida nacional es obligatoria")]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^\d{10}$", 
        ErrorMessage = "La partida nacional debe tener exactamente 10 dígitos numéricos")]
    public string PartidaNacional { get; set; } = null!;

    public string? SubpartidaNaban { get; set; }

    [System.ComponentModel.DataAnnotations.Range(0, int.MaxValue, ErrorMessage = "La cantidad de bultos no puede ser negativa")]
    public int CantidadBultos { get; set; } = 0;

    [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "El peso neto no puede ser negativo")]
    public decimal PesoNetoKg { get; set; } = 0;

    [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "El peso bruto no puede ser negativo")]
    public decimal PesoBrutoKg { get; set; } = 0;

    public string? DescripcionMercancias { get; set; }
}

// DTO para RESPONDER al frontend con los datos de la partida
public class PartidaArancelariaResponseDto
{
    public int IdPartida { get; set; }
    public int IdDam { get; set; }
    public string? PartidaNacional { get; set; }
    public string? SubpartidaNaban { get; set; }
    public int CantidadBultos { get; set; }
    public decimal PesoNetoKg { get; set; }
    public decimal PesoBrutoKg { get; set; }
    public string? DescripcionMercancias { get; set; }
}
