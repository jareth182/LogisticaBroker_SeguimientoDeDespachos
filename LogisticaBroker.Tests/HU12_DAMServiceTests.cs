/**
 * PRUEBA DE CAJA BLANCA — HU12: Generar Borrador DAM
 * Fuente: Backend/Services/DAMService.cs → ConfirmarBorradorAsync
 *
 * Se usa Moq para simular IUnitOfWork (Despachos, Dams, SaveChangesAsync)
 * y InMemory EF para los accesos directos a _context (ItemsFactura, EtapasDespacho).
 */
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using LogisticaBroker.Repositories.Interfaces;
using LogisticaBroker.Services;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LogisticaBroker.Tests;

public class HU12_DAMServiceTests
{
    // ── Helpers ─────────────────────────────────────────────────────────────
    private static AppDbContext BuildContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static (IUnitOfWork uow, Mock<IDespachoRepository> despachosMock) BuildUow(Despacho? despacho)
    {
        var despachosMock = new Mock<IDespachoRepository>();
        despachosMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(despacho);

        var damsMock = new Mock<IDamRepository>();
        var uowMock = new Mock<IUnitOfWork>();
        uowMock.Setup(u => u.Despachos).Returns(despachosMock.Object);
        uowMock.Setup(u => u.Dams).Returns(damsMock.Object);
        uowMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        return (uowMock.Object, despachosMock);
    }

    // ── PA HU12-1.4 NOK — Borrador ya generado previamente ───────────────────
    [Fact]
    public async Task ConfirmarBorrador_EstadoBorradorFinalizado_LanzaInvalidOperation()
    {
        // Fuente: DAMService.cs → if (despacho.Estado == "Borrador Finalizado")
        var despacho = new Despacho { IdDespacho = 1, IdEmpresa = 1, CodigoBl = "MSCU1234567", Estado = "Borrador Finalizado" };
        var (uow, _) = BuildUow(despacho);
        using var ctx = BuildContext("HU12_YaGenerado");

        var service = new DAMService(uow, ctx);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.ConfirmarBorradorAsync(1));

        Assert.Contains("ya cuenta con un borrador DAM generado", ex.Message);
    }

    // ── PA HU12-1.1 NOK — Existen ítems sin partida arancelaria ──────────────
    [Fact]
    public async Task ConfirmarBorrador_ItemsSinPartida_LanzaInvalidOperation()
    {
        // Fuente: DAMService.cs → if (itemsSinPartida > 0)
        var despacho = new Despacho { IdDespacho = 2, IdEmpresa = 1, CodigoBl = "MSCU9999999", Estado = "En proceso" };
        var (uow, _) = BuildUow(despacho);
        using var ctx = BuildContext("HU12_SinPartida");

        ctx.Empresas.Add(new Empresa { IdEmpresa = 1, Ruc = "20100000001", RazonSocial = "Test SAC", Correo = "t@t.com", Estado = "Afiliado Activo" });
        ctx.Despachos.Add(despacho);
        // Ítem sin partida arancelaria
        ctx.ItemsFactura.Add(new ItemFactura
        {
            IdItem = 1, IdDespacho = 2, Descripcion = "Repuestos mecánicos",
            Cantidad = 3, Valor = 200, Peso = 15, PartidaArancelaria = null
        });
        await ctx.SaveChangesAsync();

        var service = new DAMService(uow, ctx);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.ConfirmarBorradorAsync(2));

        Assert.Contains("ítems sin partida arancelaria asignada", ex.Message);
    }

    // ── PA HU12-1 OK — Generación exitosa del borrador DAM ───────────────────
    [Fact]
    public async Task ConfirmarBorrador_TodosItemsConPartida_CambiaEstadoYRetornaDTO()
    {
        // Fuente: DAMService.cs → despacho.Estado = "Borrador Finalizado" + return DTO
        var despacho = new Despacho { IdDespacho = 3, IdEmpresa = 1, CodigoBl = "MSCU1234567", Estado = "En proceso" };
        var (uow, _) = BuildUow(despacho);
        using var ctx = BuildContext("HU12_OK");

        ctx.Empresas.Add(new Empresa { IdEmpresa = 1, Ruc = "20100000001", RazonSocial = "Test SAC", Correo = "t@t.com", Estado = "Afiliado Activo" });
        ctx.Despachos.Add(despacho);
        ctx.TiposEtapa.Add(new TipoEtapa { IdTipoEtapa = 4, Nombre = "Generación DAM", Orden = 4 });
        ctx.ItemsFactura.AddRange(
            new ItemFactura { IdItem = 10, IdDespacho = 3, Descripcion = "Electrónica industrial", Cantidad = 10, Valor = 500, Peso = 25, PartidaArancelaria = "8471300000" },
            new ItemFactura { IdItem = 11, IdDespacho = 3, Descripcion = "Repuestos mecánicos",   Cantidad = 5,  Valor = 300, Peso = 15, PartidaArancelaria = "8708100000" }
        );
        await ctx.SaveChangesAsync();

        var service = new DAMService(uow, ctx);

        var resultado = await service.ConfirmarBorradorAsync(3);

        Assert.NotNull(resultado);
        Assert.Equal("Borrador Finalizado", despacho.Estado);

        // Verificar que se registró la etapa
        var etapa = await ctx.EtapasDespacho.FirstOrDefaultAsync(e => e.IdDespacho == 3 && e.IdTipoEtapa == 4);
        Assert.NotNull(etapa);
        Assert.Equal("Finalizado", etapa!.Estado);
    }

    // ── PA HU12-1.1 NOK — Despacho no encontrado ──────────────────────────────
    [Fact]
    public async Task ConfirmarBorrador_DespachoNoExiste_LanzaKeyNotFoundException()
    {
        // Fuente: DAMService.cs → ?? throw new KeyNotFoundException(...)
        var (uow, _) = BuildUow(null); // simula despacho no encontrado
        using var ctx = BuildContext("HU12_NoDespacho");

        var service = new DAMService(uow, ctx);

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.ConfirmarBorradorAsync(99));
    }
}
