using System.ComponentModel.DataAnnotations;

namespace LogisticaBroker.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    public string Correo { get; set; } = null!;

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    public string Contrasena { get; set; } = null!;
}

public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public DateTime Expiracion { get; set; }
    public UsuarioInfoDto Usuario { get; set; } = null!;
}

public class UsuarioInfoDto
{
    public int IdUsuario { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Rol { get; set; } = null!;
    public int? IdEmpresa { get; set; }
    public string? EstadoEmpresa { get; set; }
    public bool RequiereCambioContrasena { get; set; }
}

public class RecuperarContrasenaDto
{
    [Required(ErrorMessage = "El correo es obligatorio")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido")]
    public string Correo { get; set; } = null!;
}

public class CambiarContrasenaDto
{
    [Required(ErrorMessage = "El token es obligatorio")]
    public string Token { get; set; } = null!;

    [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string NuevaContrasena { get; set; } = null!;
}

public class ActualizarContrasenaDto
{
    [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string NuevaContrasena { get; set; } = null!;
}
