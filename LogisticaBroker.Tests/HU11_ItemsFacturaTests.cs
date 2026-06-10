/**
 * PRUEBA DE CAJA BLANCA — HU11: Editar Detalle Mercancía
 * Fuente: Backend/Controllers/ItemsFacturaController.cs
 *
 * Se prueba el endpoint PUT /api/ItemsFactura/{idItem} con las distintas
 * combinaciones de partida arancelaria válida/inválida y restricción técnica.
 */
using LogisticaBroker.Controllers;
using LogisticaBroker.Data;
using LogisticaBroker.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LogisticaBroker.Tests;

public class HU11_ItemsFacturaTests
{
    // ── Helpers ─────────────────────────────────────────────────────────────
    private static AppDbContext BuildContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static async Task<AppDbContext> ContextConItemAsync(string dbName, int idItem = 1)
    {
        var ctx = BuildContext(dbName);
        ctx.Empresas.Add(new Empresa { IdEmpresa = 1, Ruc = "20100000001", RazonSocial = "Test SAC", Correo = "t@t.com", Estado = "Afiliado Activo" });
        ctx.Despachos.Add(new Despacho { IdDespacho = 1, IdEmpresa = 1, CodigoBl = "MSCU1234567", Estado = "En proceso" });
        ctx.ItemsFactura.Add(new ItemFactura
        {
            IdItem = idItem, IdDespacho = 1,
            Descripcion = "Electrónica industrial",
            Cantidad = 10, Valor = 500, Peso = 25
        });
        await ctx.SaveChangesAsync();
        return ctx;
    }

    // ── PA HU11-2.1 NOK — Campo de partida arancelaria vacío ─────────────────
    [Fact]
    public async Task ActualizarItem_PartidaVacia_RetornaBadRequest()
    {
        // Fuente: ItemsFacturaController.cs:84-85
        using var ctx = await ContextConItemAsync("HU11_PartidaVacia");
        var ctrl = new ItemsFacturaController(ctx);

        var dto = new ActualizarItemDto { PartidaArancelaria = "", TieneRestriccion = false, UsuarioModificacion = "test" };
        var result = await ctrl.ActualizarItem(1, dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("campo de partida arancelaria es obligatorio", body);
    }

    // ── PA HU11-3.1 NOK — Restricción sin partida (dead branch, pero validado en frontend)
    [Fact]
    public async Task ActualizarItem_PartidaVaciaConRestriccion_RetornaBadRequest()
    {
        // Fuente: ItemsFacturaController.cs:87-88
        // La primera guarda (vacío) captura este caso; confirmamos que el mensaje es correcto
        using var ctx = await ContextConItemAsync("HU11_RestriccionSinPartida");
        var ctrl = new ItemsFacturaController(ctx);

        var dto = new ActualizarItemDto { PartidaArancelaria = null, TieneRestriccion = true, UsuarioModificacion = "test" };
        var result = await ctrl.ActualizarItem(1, dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("obligatorio", body);
    }

    // ── PA HU11-2.2 NOK — Formato de partida arancelaria inválido ─────────────
    [Theory]
    [InlineData("AB71-300")]     // letras y guión
    [InlineData("847130000")]    // 9 dígitos
    [InlineData("84713000001")]  // 11 dígitos
    [InlineData("8471-30000")]   // con guión
    public async Task ActualizarItem_FormatoInvalido_RetornaBadRequest(string partida)
    {
        // Fuente: ItemsFacturaController.cs:90-91
        var dbName = $"HU11_Formato_{partida}";
        using var ctx = await ContextConItemAsync(dbName);
        var ctrl = new ItemsFacturaController(ctx);

        var dto = new ActualizarItemDto { PartidaArancelaria = partida, TieneRestriccion = false, UsuarioModificacion = "test" };
        var result = await ctrl.ActualizarItem(1, dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        var body = bad.Value!.ToString();
        Assert.Contains("únicamente caracteres numéricos", body);
    }

    // ── PA HU11-2 OK — Guardado exitoso de partida arancelaria ───────────────
    [Fact]
    public async Task ActualizarItem_PartidaValida_RetornaOk()
    {
        // Fuente: ItemsFacturaController.cs:99-108
        using var ctx = await ContextConItemAsync("HU11_OK");
        var ctrl = new ItemsFacturaController(ctx);

        var dto = new ActualizarItemDto { PartidaArancelaria = "8471300000", TieneRestriccion = false, UsuarioModificacion = "operador@test.com" };
        var result = await ctrl.ActualizarItem(1, dto);

        Assert.IsType<OkObjectResult>(result);

        var itemBD = await ctx.ItemsFactura.FindAsync(1);
        Assert.Equal("8471300000", itemBD!.PartidaArancelaria);
        Assert.False(itemBD.TieneRestriccion);
        Assert.NotNull(itemBD.FechaModificacion);
    }

    // ── PA HU11-3 OK — Guardado con indicador de restricciones técnicas ───────
    [Fact]
    public async Task ActualizarItem_ConRestriccion_GuardaIndicadorAlerta()
    {
        // Fuente: ItemsFacturaController.cs:99-108 → TieneRestriccion = true
        using var ctx = await ContextConItemAsync("HU11_Restriccion");
        var ctrl = new ItemsFacturaController(ctx);

        var dto = new ActualizarItemDto { PartidaArancelaria = "8471300000", TieneRestriccion = true, UsuarioModificacion = "operador@test.com" };
        var result = await ctrl.ActualizarItem(1, dto);

        Assert.IsType<OkObjectResult>(result);

        var itemBD = await ctx.ItemsFactura.FindAsync(1);
        Assert.True(itemBD!.TieneRestriccion);
    }
}
