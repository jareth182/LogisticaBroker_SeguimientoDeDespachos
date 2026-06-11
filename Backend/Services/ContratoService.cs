using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Data;
using LogisticaBroker.Models;

namespace LogisticaBroker.Services;

public class ContratoService
{
    private readonly AppDbContext _context;

    public ContratoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ContratoServicio> CrearContratoAsync(ContratoServicio contrato)
    {
        contrato.FechaGeneracion = DateTime.UtcNow;
        contrato.EstadoFirma = "Borrador";

        _context.ContratosServicio.Add(contrato);
        await _context.SaveChangesAsync();

        return contrato;
    }

    public async Task<FirmaResponse> FirmarContratoAsync(int id, FirmaRequest request)
    {
        var contrato = await ObtenerContratoAsync(id);
        
        // Validar que el contrato esté en estado de poder firmarse
        if (contrato.EstadoFirma != "Pendiente")
        {
            throw new InvalidOperationException($"El contrato no puede ser firmado en estado: {contrato.EstadoFirma}");
        }

        // Actualizar contrato en base de datos
        contrato.FechaFirma = DateTime.UtcNow;
        contrato.EstadoFirma = "Firmado";
        contrato.TokenFirma = request.FirmaDigital;
        contrato.UrlDocumento = await GenerarPDFContratoAsync(contrato);

        // Guardar cambios en base de datos
        _context.ContratosServicio.Update(contrato);
        await _context.SaveChangesAsync();

        // Actualizar estado de la empresa a "Afiliado Activo"
        await ActualizarEstadoEmpresaAsync(contrato.IdEmpresa);

        return new FirmaResponse
        {
            ContratoId = id,
            Mensaje = "Contrato firmado correctamente",
            ContratoFirmado = contrato.UrlDocumento,
            FirmaDigital = request.FirmaDigital,
            FechaFirma = DateTime.UtcNow,
            UrlAlmacenamiento = contrato.UrlDocumento
        };
    }

    public async Task<ContratoServicio> ObtenerContratoAsync(int id)
    {
        var contrato = await _context.ContratosServicio
            .Include(c => c.Empresa)
            .FirstOrDefaultAsync(c => c.IdContrato == id);

        if (contrato == null)
        {
            throw new KeyNotFoundException($"Contrato con ID {id} no encontrado");
        }

        return contrato;
    }

    private async Task<string> GenerarNumeroContratoAsync()
    {
        // TODO: Implementar lógica real de generación
        var año = DateTime.UtcNow.Year;
        var correlativo = new Random().Next(1000, 9999);
        return $"CTR-{año}-{correlativo}";
    }

    private async Task<string> GenerarFirmaDigitalAsync(FirmaRequest request)
    {
        // TODO: Implementar lógica real de generación de firma digital
        await Task.CompletedTask;
        return $"firma_digital_{Guid.NewGuid()}";
    }

    private async Task<string> GenerarPDFContratoAsync(ContratoServicio contrato)
    {
        // TODO: Implementar generación real de PDF
        await Task.CompletedTask;
        return $"pdf_firmado_base64_{Guid.NewGuid()}";
    }

    private async Task ActualizarEstadoEmpresaAsync(int empresaId)
    {
        var empresa = await _context.Empresas.FindAsync(empresaId);
        if (empresa != null)
        {
            empresa.Estado = "Afiliado Activo";
            await _context.SaveChangesAsync();
        }

        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.IdEmpresa == empresaId);
        if (usuario != null)
        {
            usuario.DebeActualizarContrasena = true;
            await _context.SaveChangesAsync();
        }
    }
}
