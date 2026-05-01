namespace LogisticaBroker.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
    public AuthUsuario Usuario { get; set; } = new();
}

public class AuthUsuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime UltimoLogin { get; set; }
}
