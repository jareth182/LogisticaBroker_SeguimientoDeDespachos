namespace LogisticaBroker.Models;

public class Contrato
{
    public int Id { get; set; }
    public int EmpresaId { get; set; }
    public string NumeroContrato { get; set; } = string.Empty;
    public string TipoContrato { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaFirma { get; set; }
    public string Estado { get; set; } = string.Empty; // Borrador, PendienteFirma, Firmado, Vigente, Expirado
    public string Contenido { get; set; } = string.Empty; // Contenido del contrato en texto o HTML
    public string FirmaDigital { get; set; } = string.Empty;
    public string UrlDocumento { get; set; } = string.Empty;
    public List<Firma> Firmas { get; set; } = new();
}

public class FirmaRequest
{
    public string NombreFirmante { get; set; } = string.Empty;
    public string EmailFirmante { get; set; } = string.Empty;
    public string CargoFirmante { get; set; } = string.Empty;
    public string FirmaDigital { get; set; } = string.Empty; // Firma digital en base64
    public string CertificadoDigital { get; set; } = string.Empty; // Certificado digital
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
}

public class FirmaResponse
{
    public int ContratoId { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public string ContratoFirmado { get; set; } = string.Empty; // PDF firmado en base64
    public string FirmaDigital { get; set; } = string.Empty;
    public DateTime FechaFirma { get; set; }
    public string UrlAlmacenamiento { get; set; } = string.Empty;
}

public class Firma
{
    public int Id { get; set; }
    public int ContratoId { get; set; }
    public string NombreFirmante { get; set; } = string.Empty;
    public string EmailFirmante { get; set; } = string.Empty;
    public string CargoFirmante { get; set; } = string.Empty;
    public string FirmaDigital { get; set; } = string.Empty;
    public DateTime FechaFirma { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public bool EsValida { get; set; }
}

public class DocumentoAlmacenado
{
    public string NombreArchivo { get; set; } = string.Empty;
    public byte[] Contenido { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime FechaSubida { get; set; }
    public long TamanoBytes { get; set; }
}
