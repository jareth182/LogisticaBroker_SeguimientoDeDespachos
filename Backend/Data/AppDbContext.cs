using Microsoft.EntityFrameworkCore;
using LogisticaBroker.Models;

namespace LogisticaBroker.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Rol> Roles { get; set; }
    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<ContratoServicio> ContratosServicio { get; set; }
    public DbSet<CanalSunat> CanalesSunat { get; set; }
    public DbSet<Despacho> Despachos { get; set; }
    public DbSet<RestriccionLegal> RestriccionesLegales { get; set; }
    public DbSet<DespachoRestriccion> DespachosRestricciones { get; set; }
    public DbSet<TipoEtapa> TiposEtapa { get; set; }
    public DbSet<EtapaDespacho> EtapasDespacho { get; set; }
    public DbSet<DiligenciaAforo> DiligenciasAforo { get; set; }
    public DbSet<FotoAforo> FotosAforo { get; set; }
    public DbSet<LogisticaTransporte> LogisticasTransporte { get; set; }
    public DbSet<Dam> Dams { get; set; }
    public DbSet<PartidaArancelaria> PartidasArancelarias { get; set; }
    public DbSet<TipoDocumento> TiposDocumento { get; set; }
    public DbSet<Documento> Documentos { get; set; }
    public DbSet<NotificacionEmail> NotificacionesEmail { get; set; }
    public DbSet<ComprobantePago> ComprobantesPago { get; set; }
    public DbSet<Auditoria> Auditorias { get; set; }
    public DbSet<DocumentoLogistico> DocumentosLogisticos { get; set; }
    public DbSet<ItemFactura> ItemsFactura { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── ROL ──────────────────────────────────────────────
        modelBuilder.Entity<Rol>(e => {
            e.HasKey(r => r.IdRol);
            e.Property(r => r.NombreRol).HasMaxLength(50).IsRequired();
            e.HasIndex(r => r.NombreRol).IsUnique();
            e.Property(r => r.Descripcion).HasMaxLength(200);
        });

        // ── EMPRESA ──────────────────────────────────────────
        modelBuilder.Entity<Empresa>(e => {
            e.HasKey(x => x.IdEmpresa);
            e.Property(x => x.CodigoOrden).HasMaxLength(20);
            e.HasIndex(x => x.CodigoOrden).IsUnique();
            e.Property(x => x.Ruc).HasMaxLength(11).IsFixedLength().IsRequired();
            e.HasIndex(x => x.Ruc).IsUnique();
            e.Property(x => x.RazonSocial).HasMaxLength(200).IsRequired();
            e.Property(x => x.NombreContacto).HasMaxLength(150).IsRequired();
            e.Property(x => x.Correo).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Correo).IsUnique();
            e.Property(x => x.Celular).HasMaxLength(20);
            e.Property(x => x.Direccion).HasMaxLength(300);
            e.Property(x => x.Rubro).HasMaxLength(80);
            e.Property(x => x.MontoItem).HasColumnType("numeric(12,2)");
            e.Property(x => x.Estado).HasMaxLength(30).HasDefaultValue("Pendiente");
        });

        // ── USUARIO ──────────────────────────────────────────
        modelBuilder.Entity<Usuario>(e => {
            e.HasKey(x => x.IdUsuario);
            e.Property(x => x.NombreCompleto).HasMaxLength(150).IsRequired();
            e.Property(x => x.Correo).HasMaxLength(150).IsRequired();
            e.HasIndex(x => x.Correo).IsUnique();
            e.Property(x => x.ContrasenaHash).HasMaxLength(255).IsRequired();
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Activo");

            e.HasOne(x => x.Rol)
             .WithMany(r => r.Usuarios)
             .HasForeignKey(x => x.IdRol)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Empresa)
             .WithMany(em => em.Usuarios)
             .HasForeignKey(x => x.IdEmpresa)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── CONTRATO_SERVICIO ─────────────────────────────────
        modelBuilder.Entity<ContratoServicio>(e => {
            e.HasKey(x => x.IdContrato);
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Version).HasMaxLength(10).IsRequired();
            e.Property(x => x.EstadoFirma).HasMaxLength(30).HasDefaultValue("Pendiente");
            e.Property(x => x.UrlDocumento).HasMaxLength(400);
            e.Property(x => x.TokenFirma).HasMaxLength(255);

            e.HasOne(x => x.Empresa)
             .WithOne(em => em.Contrato)
             .HasForeignKey<ContratoServicio>(x => x.IdEmpresa)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── CANAL_SUNAT ───────────────────────────────────────
        modelBuilder.Entity<CanalSunat>(e => {
            e.HasKey(x => x.IdCanal);
            e.Property(x => x.NombreCanal).HasMaxLength(30).IsRequired();
            e.HasIndex(x => x.NombreCanal).IsUnique();
            e.Property(x => x.Descripcion).HasMaxLength(100);
            e.Property(x => x.ColorHex).HasMaxLength(7).IsFixedLength();
        });

        // ── DESPACHO ──────────────────────────────────────────
        modelBuilder.Entity<Despacho>(e => {
            e.HasKey(x => x.IdDespacho);
            e.Property(x => x.CodigoBl).HasMaxLength(50).IsRequired();
            e.HasIndex(x => x.CodigoBl).IsUnique();
            e.Property(x => x.CodigoOrden).HasMaxLength(20);
            e.Property(x => x.Nave).HasMaxLength(100);
            e.Property(x => x.Contenedor).HasMaxLength(30);
            e.Property(x => x.Origen).HasMaxLength(100);
            e.Property(x => x.Destino).HasMaxLength(100);
            e.Property(x => x.Mercancia).HasMaxLength(200);
            e.Property(x => x.Estado).HasMaxLength(30).HasDefaultValue("En proceso");

            e.HasOne(x => x.Empresa)
             .WithMany(em => em.Despachos)
             .HasForeignKey(x => x.IdEmpresa)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Canal)
             .WithMany(c => c.Despachos)
             .HasForeignKey(x => x.IdCanal)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── RESTRICCION_LEGAL ─────────────────────────────────
        modelBuilder.Entity<RestriccionLegal>(e => {
            e.HasKey(x => x.IdRestriccion);
            e.Property(x => x.Nombre).HasMaxLength(100).IsRequired();
            e.HasIndex(x => x.Nombre).IsUnique();
            e.Property(x => x.Entidad).HasMaxLength(80).IsRequired();
            e.Property(x => x.Descripcion).HasMaxLength(300);
        });

        // ── DESPACHO_RESTRICCION (N:M) ────────────────────────
        modelBuilder.Entity<DespachoRestriccion>(e => {
            e.HasKey(x => new { x.IdDespacho, x.IdRestriccion });
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");

            e.HasOne(x => x.Despacho)
             .WithMany(d => d.Restricciones)
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Restriccion)
             .WithMany(r => r.Despachos)
             .HasForeignKey(x => x.IdRestriccion)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── TIPO_ETAPA ────────────────────────────────────────
        modelBuilder.Entity<TipoEtapa>(e => {
            e.HasKey(x => x.IdTipoEtapa);
            e.Property(x => x.Nombre).HasMaxLength(80).IsRequired();
            e.HasIndex(x => x.Nombre).IsUnique();
            e.Property(x => x.Descripcion).HasMaxLength(200);
            e.HasIndex(x => x.Orden).IsUnique();
        });

        // ── ETAPA_DESPACHO ────────────────────────────────────
        modelBuilder.Entity<EtapaDespacho>(e => {
            e.HasKey(x => x.IdEtapa);
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");
            e.HasIndex(x => new { x.IdDespacho, x.IdTipoEtapa }).IsUnique();

            e.HasOne(x => x.Despacho)
             .WithMany(d => d.Etapas)
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.TipoEtapa)
             .WithMany(t => t.Etapas)
             .HasForeignKey(x => x.IdTipoEtapa)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.UsuarioResponsable)
             .WithMany(u => u.EtapasResponsable)
             .HasForeignKey(x => x.IdUsuarioResponsable)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── DILIGENCIA_AFORO ──────────────────────────────────
        modelBuilder.Entity<DiligenciaAforo>(e => {
            e.HasKey(x => x.IdDiligencia);
            e.Property(x => x.ResultadoRevision).HasMaxLength(20);

            e.HasOne(x => x.Despacho)
             .WithMany(d => d.Diligencias)
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Usuario)
             .WithMany(u => u.Diligencias)
             .HasForeignKey(x => x.IdUsuario)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── FOTO_AFORO ────────────────────────────────────────
        modelBuilder.Entity<FotoAforo>(e => {
            e.HasKey(x => x.IdFoto);
            e.Property(x => x.UrlFoto).HasMaxLength(400).IsRequired();
            e.Property(x => x.Descripcion).HasMaxLength(200);

            e.HasOne(x => x.Diligencia)
             .WithMany(d => d.Fotos)
             .HasForeignKey(x => x.IdDiligencia)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── LOGISTICA_TRANSPORTE ──────────────────────────────
        modelBuilder.Entity<LogisticaTransporte>(e => {
            e.HasKey(x => x.IdTransporte);
            e.Property(x => x.EmpresaTransporte).HasMaxLength(200);
            e.Property(x => x.PlacaVehiculo).HasMaxLength(20);
            e.Property(x => x.EstadoEntrega).HasMaxLength(20).HasDefaultValue("Pendiente");
            e.Property(x => x.UrlActaRecepcion).HasMaxLength(400);

            e.HasOne(x => x.Despacho)
             .WithOne(d => d.Transporte)
             .HasForeignKey<LogisticaTransporte>(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DAM ───────────────────────────────────────────────
        modelBuilder.Entity<Dam>(e => {
            e.HasKey(x => x.IdDam);
            e.Property(x => x.ImportadorExportador).HasMaxLength(200);
            e.Property(x => x.CodDocIdentificacion).HasMaxLength(30);
            e.Property(x => x.DireccionImportador).HasMaxLength(300);
            e.Property(x => x.EmpresaTransporte).HasMaxLength(200);
            e.Property(x => x.ViaTransporte).HasMaxLength(30).HasDefaultValue("Marítimo");
            e.Property(x => x.PuertoEmbarque).HasMaxLength(100);
            e.Property(x => x.TerminalAlmacenamiento).HasMaxLength(200);
            e.Property(x => x.ValorFob).HasColumnType("numeric(14,2)");
            e.Property(x => x.Flete).HasColumnType("numeric(14,2)");
            e.Property(x => x.Seguro).HasColumnType("numeric(14,2)");
            e.Property(x => x.TotalAjustes).HasColumnType("numeric(14,2)");
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Borrador");
            e.Ignore(x => x.ValorCifTotal); // calculado en C#, no columna BD

            e.HasOne(x => x.Despacho)
             .WithOne(d => d.Dam)
             .HasForeignKey<Dam>(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.UsuarioCreador)
             .WithMany()
             .HasForeignKey(x => x.IdUsuarioCreador)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PARTIDA_ARANCELARIA ───────────────────────────────
        modelBuilder.Entity<PartidaArancelaria>(e => {
            e.HasKey(x => x.IdPartida);
            e.Property(x => x.PartidaNacional).HasMaxLength(20);
            e.Property(x => x.SubpartidaNaban).HasMaxLength(20);
            e.Property(x => x.PesoNetoKg).HasColumnType("numeric(10,3)");
            e.Property(x => x.PesoBrutoKg).HasColumnType("numeric(10,3)");

            e.HasOne(x => x.Dam)
            .WithMany(d => d.Partidas)
            .HasForeignKey(x => x.IdDam)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);          // ← nullable

            e.HasOne(x => x.Despacho)    // ← nueva relación
            .WithMany(d => d.Partidas)
            .HasForeignKey(x => x.IdDespacho)
            .OnDelete(DeleteBehavior.Restrict);
        });

        // ── TIPO_DOCUMENTO ────────────────────────────────────
        modelBuilder.Entity<TipoDocumento>(e => {
            e.HasKey(x => x.IdTipoDoc);
            e.Property(x => x.Nombre).HasMaxLength(80).IsRequired();
            e.HasIndex(x => x.Nombre).IsUnique();
            e.Property(x => x.Descripcion).HasMaxLength(200);
        });

        // ── DOCUMENTO ─────────────────────────────────────────
        modelBuilder.Entity<Documento>(e => {
            e.HasKey(x => x.IdDocumento);
            e.Property(x => x.Nombre).HasMaxLength(200).IsRequired();
            e.Property(x => x.RutaArchivo).HasMaxLength(400).IsRequired();
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");

            e.HasOne(x => x.Empresa)
             .WithMany(em => em.Documentos)
             .HasForeignKey(x => x.IdEmpresa)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.TipoDocumento)
             .WithMany(t => t.Documentos)
             .HasForeignKey(x => x.IdTipoDoc)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.UsuarioCargador)
             .WithMany(u => u.DocumentosCargados)
             .HasForeignKey(x => x.IdUsuarioCargador)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.UsuarioValidador)
             .WithMany(u => u.DocumentosValidados)
             .HasForeignKey(x => x.IdUsuarioValidador)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── NOTIFICACION_EMAIL ────────────────────────────────
        modelBuilder.Entity<NotificacionEmail>(e => {
            e.HasKey(x => x.IdNotificacion);
            e.Property(x => x.CorreoDestino).HasMaxLength(150).IsRequired();
            e.Property(x => x.Asunto).HasMaxLength(200).IsRequired();
            e.Property(x => x.PlantillaUsada).HasMaxLength(60);
            e.Property(x => x.EstadoEnvio).HasMaxLength(20).HasDefaultValue("Enviado");

            e.HasOne(x => x.Documento)
             .WithMany(d => d.Notificaciones)
             .HasForeignKey(x => x.IdDocumento)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.UsuarioEmisor)
             .WithMany(u => u.NotificacionesEnviadas)
             .HasForeignKey(x => x.IdUsuarioEmisor)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── COMPROBANTE_PAGO ──────────────────────────────────
        modelBuilder.Entity<ComprobantePago>(e => {
            e.HasKey(x => x.IdComprobante);
            e.Property(x => x.RutaArchivo).HasMaxLength(400).IsRequired();
            e.Property(x => x.Formato).HasMaxLength(10).IsRequired();
            e.Property(x => x.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");

            e.HasOne(x => x.Despacho)
             .WithMany(d => d.Comprobantes)
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.UsuarioValidador)
             .WithMany()
             .HasForeignKey(x => x.IdUsuarioValidador)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── DOCUMENTO_LOGISTICO ───────────────────────────────────
        modelBuilder.Entity<DocumentoLogistico>(e => {
            e.HasKey(x => x.IdDocumentoLogistico);
            e.Property(x => x.TipoDocumento).HasMaxLength(80).IsRequired();
            e.Property(x => x.NombreArchivo).HasMaxLength(200).IsRequired();
            e.Property(x => x.RutaArchivo).HasMaxLength(400).IsRequired();

            e.HasOne(x => x.Despacho)
             .WithMany()
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.UsuarioCargador)
             .WithMany()
             .HasForeignKey(x => x.IdUsuarioCargador)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ITEM_FACTURA ──────────────────────────────────────────
        modelBuilder.Entity<ItemFactura>(e => {
            e.HasKey(x => x.IdItem);
            e.Property(x => x.Descripcion).HasMaxLength(300).IsRequired();
            e.Property(x => x.Cantidad).HasColumnType("numeric(12,3)");
            e.Property(x => x.Valor).HasColumnType("numeric(14,2)");
            e.Property(x => x.Peso).HasColumnType("numeric(10,3)");
            e.Property(x => x.PartidaArancelaria).HasMaxLength(10);
            e.Property(x => x.UsuarioModificacion).HasMaxLength(150);

            e.HasOne(x => x.Despacho)
             .WithMany()
             .HasForeignKey(x => x.IdDespacho)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── AUDITORIA ─────────────────────────────────────────
        modelBuilder.Entity<Auditoria>(e => {
            e.HasKey(x => x.IdAuditoria);
            e.Property(x => x.TablaAfectada).HasMaxLength(60).IsRequired();
            e.Property(x => x.Accion).HasMaxLength(20).IsRequired();
            e.Property(x => x.Ip).HasMaxLength(45);

            e.HasOne(x => x.Usuario)
             .WithMany(u => u.Auditorias)
             .HasForeignKey(x => x.IdUsuario)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
