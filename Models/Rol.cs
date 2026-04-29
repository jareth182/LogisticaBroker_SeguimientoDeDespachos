namespace LogisticaBroker.Models;

public class Rol
{
    public int IdRol { get; set; }
    public string NombreRol { get; set; } = null!;
    public string? Descripcion { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = [];
}
