using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class TablasIniciales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CanalesSunat",
                columns: table => new
                {
                    IdCanal = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreCanal = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ColorHex = table.Column<string>(type: "character(7)", fixedLength: true, maxLength: 7, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CanalesSunat", x => x.IdCanal);
                });

            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    IdEmpresa = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CodigoOrden = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Ruc = table.Column<string>(type: "character(11)", fixedLength: true, maxLength: 11, nullable: false),
                    RazonSocial = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NombreContacto = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Correo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Celular = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Direccion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Rubro = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    MontoItem = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    Estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Pendiente"),
                    FechaRegistro = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.IdEmpresa);
                });

            migrationBuilder.CreateTable(
                name: "RestriccionesLegales",
                columns: table => new
                {
                    IdRestriccion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Entidad = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestriccionesLegales", x => x.IdRestriccion);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    IdRol = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreRol = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.IdRol);
                });

            migrationBuilder.CreateTable(
                name: "TiposDocumento",
                columns: table => new
                {
                    IdTipoDoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDocumento", x => x.IdTipoDoc);
                });

            migrationBuilder.CreateTable(
                name: "TiposEtapa",
                columns: table => new
                {
                    IdTipoEtapa = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Orden = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposEtapa", x => x.IdTipoEtapa);
                });

            migrationBuilder.CreateTable(
                name: "ContratosServicio",
                columns: table => new
                {
                    IdContrato = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEmpresa = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Version = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    EstadoFirma = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Pendiente"),
                    UrlDocumento = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                    TokenFirma = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EdicionBloqueada = table.Column<bool>(type: "boolean", nullable: false),
                    FechaGeneracion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaFirma = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContratosServicio", x => x.IdContrato);
                    table.ForeignKey(
                        name: "FK_ContratosServicio_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "IdEmpresa",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Despachos",
                columns: table => new
                {
                    IdDespacho = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEmpresa = table.Column<int>(type: "integer", nullable: false),
                    IdCanal = table.Column<int>(type: "integer", nullable: true),
                    CodigoBl = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CodigoOrden = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Nave = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Contenedor = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Origen = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Destino = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Eta = table.Column<DateOnly>(type: "date", nullable: true),
                    Mercancia = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PorcentajeProgreso = table.Column<short>(type: "smallint", nullable: false),
                    Estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "En proceso"),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Despachos", x => x.IdDespacho);
                    table.ForeignKey(
                        name: "FK_Despachos_CanalesSunat_IdCanal",
                        column: x => x.IdCanal,
                        principalTable: "CanalesSunat",
                        principalColumn: "IdCanal",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Despachos_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "IdEmpresa",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdRol = table.Column<int>(type: "integer", nullable: false),
                    IdEmpresa = table.Column<int>(type: "integer", nullable: true),
                    NombreCompleto = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Correo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ContrasenaHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Activo"),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                    table.ForeignKey(
                        name: "FK_Usuarios_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "IdEmpresa",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Usuarios_Roles_IdRol",
                        column: x => x.IdRol,
                        principalTable: "Roles",
                        principalColumn: "IdRol",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DespachosRestricciones",
                columns: table => new
                {
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    IdRestriccion = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    FechaAprobacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DespachosRestricciones", x => new { x.IdDespacho, x.IdRestriccion });
                    table.ForeignKey(
                        name: "FK_DespachosRestricciones_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DespachosRestricciones_RestriccionesLegales_IdRestriccion",
                        column: x => x.IdRestriccion,
                        principalTable: "RestriccionesLegales",
                        principalColumn: "IdRestriccion",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LogisticasTransporte",
                columns: table => new
                {
                    IdTransporte = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    EmpresaTransporte = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PlacaVehiculo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EstadoEntrega = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    FechaRetiro = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UrlActaRecepcion = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogisticasTransporte", x => x.IdTransporte);
                    table.ForeignKey(
                        name: "FK_LogisticasTransporte_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Auditorias",
                columns: table => new
                {
                    IdAuditoria = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    TablaAfectada = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Accion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Detalle = table.Column<string>(type: "text", nullable: true),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Auditorias", x => x.IdAuditoria);
                    table.ForeignKey(
                        name: "FK_Auditorias_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ComprobantesPago",
                columns: table => new
                {
                    IdComprobante = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioValidador = table.Column<int>(type: "integer", nullable: true),
                    RutaArchivo = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Formato = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    MotivoRechazo = table.Column<string>(type: "text", nullable: true),
                    FechaSubida = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaValidacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprobantesPago", x => x.IdComprobante);
                    table.ForeignKey(
                        name: "FK_ComprobantesPago_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComprobantesPago_Usuarios_IdUsuarioValidador",
                        column: x => x.IdUsuarioValidador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Dams",
                columns: table => new
                {
                    IdDam = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioCreador = table.Column<int>(type: "integer", nullable: false),
                    ImportadorExportador = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CodDocIdentificacion = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    DireccionImportador = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    EmpresaTransporte = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ViaTransporte = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "Marítimo"),
                    PuertoEmbarque = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TerminalAlmacenamiento = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ValorFob = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Flete = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Seguro = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    TotalAjustes = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Borrador"),
                    EdicionBloqueada = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaFinalizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dams", x => x.IdDam);
                    table.ForeignKey(
                        name: "FK_Dams_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Dams_Usuarios_IdUsuarioCreador",
                        column: x => x.IdUsuarioCreador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DiligenciasAforo",
                columns: table => new
                {
                    IdDiligencia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    FechaProgramada = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResultadoRevision = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiligenciasAforo", x => x.IdDiligencia);
                    table.ForeignKey(
                        name: "FK_DiligenciasAforo_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DiligenciasAforo_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Documentos",
                columns: table => new
                {
                    IdDocumento = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEmpresa = table.Column<int>(type: "integer", nullable: false),
                    IdTipoDoc = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioCargador = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioValidador = table.Column<int>(type: "integer", nullable: true),
                    Nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RutaArchivo = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    FechaCarga = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaValidacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documentos", x => x.IdDocumento);
                    table.ForeignKey(
                        name: "FK_Documentos_Empresas_IdEmpresa",
                        column: x => x.IdEmpresa,
                        principalTable: "Empresas",
                        principalColumn: "IdEmpresa",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documentos_TiposDocumento_IdTipoDoc",
                        column: x => x.IdTipoDoc,
                        principalTable: "TiposDocumento",
                        principalColumn: "IdTipoDoc",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documentos_Usuarios_IdUsuarioCargador",
                        column: x => x.IdUsuarioCargador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Documentos_Usuarios_IdUsuarioValidador",
                        column: x => x.IdUsuarioValidador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "EtapasDespacho",
                columns: table => new
                {
                    IdEtapa = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    IdTipoEtapa = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioResponsable = table.Column<int>(type: "integer", nullable: true),
                    Estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente"),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FechaHora = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EtapasDespacho", x => x.IdEtapa);
                    table.ForeignKey(
                        name: "FK_EtapasDespacho_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EtapasDespacho_TiposEtapa_IdTipoEtapa",
                        column: x => x.IdTipoEtapa,
                        principalTable: "TiposEtapa",
                        principalColumn: "IdTipoEtapa",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EtapasDespacho_Usuarios_IdUsuarioResponsable",
                        column: x => x.IdUsuarioResponsable,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PartidasArancelarias",
                columns: table => new
                {
                    IdPartida = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDam = table.Column<int>(type: "integer", nullable: false),
                    PartidaNacional = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SubpartidaNaban = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CantidadBultos = table.Column<int>(type: "integer", nullable: false),
                    PesoNetoKg = table.Column<decimal>(type: "numeric(10,3)", nullable: false),
                    PesoBrutoKg = table.Column<decimal>(type: "numeric(10,3)", nullable: false),
                    DescripcionMercancias = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartidasArancelarias", x => x.IdPartida);
                    table.ForeignKey(
                        name: "FK_PartidasArancelarias_Dams_IdDam",
                        column: x => x.IdDam,
                        principalTable: "Dams",
                        principalColumn: "IdDam",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FotosAforo",
                columns: table => new
                {
                    IdFoto = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDiligencia = table.Column<int>(type: "integer", nullable: false),
                    UrlFoto = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    FechaSubida = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FotosAforo", x => x.IdFoto);
                    table.ForeignKey(
                        name: "FK_FotosAforo_DiligenciasAforo_IdDiligencia",
                        column: x => x.IdDiligencia,
                        principalTable: "DiligenciasAforo",
                        principalColumn: "IdDiligencia",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificacionesEmail",
                columns: table => new
                {
                    IdNotificacion = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDocumento = table.Column<int>(type: "integer", nullable: false),
                    IdUsuarioEmisor = table.Column<int>(type: "integer", nullable: false),
                    CorreoDestino = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Asunto = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Mensaje = table.Column<string>(type: "text", nullable: true),
                    PlantillaUsada = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    EstadoEnvio = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "Enviado"),
                    FechaEnvio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificacionesEmail", x => x.IdNotificacion);
                    table.ForeignKey(
                        name: "FK_NotificacionesEmail_Documentos_IdDocumento",
                        column: x => x.IdDocumento,
                        principalTable: "Documentos",
                        principalColumn: "IdDocumento",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotificacionesEmail_Usuarios_IdUsuarioEmisor",
                        column: x => x.IdUsuarioEmisor,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Auditorias_IdUsuario",
                table: "Auditorias",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_CanalesSunat_NombreCanal",
                table: "CanalesSunat",
                column: "NombreCanal",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ComprobantesPago_IdDespacho",
                table: "ComprobantesPago",
                column: "IdDespacho");

            migrationBuilder.CreateIndex(
                name: "IX_ComprobantesPago_IdUsuarioValidador",
                table: "ComprobantesPago",
                column: "IdUsuarioValidador");

            migrationBuilder.CreateIndex(
                name: "IX_ContratosServicio_IdEmpresa",
                table: "ContratosServicio",
                column: "IdEmpresa",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dams_IdDespacho",
                table: "Dams",
                column: "IdDespacho",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Dams_IdUsuarioCreador",
                table: "Dams",
                column: "IdUsuarioCreador");

            migrationBuilder.CreateIndex(
                name: "IX_Despachos_CodigoBl",
                table: "Despachos",
                column: "CodigoBl",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Despachos_IdCanal",
                table: "Despachos",
                column: "IdCanal");

            migrationBuilder.CreateIndex(
                name: "IX_Despachos_IdEmpresa",
                table: "Despachos",
                column: "IdEmpresa");

            migrationBuilder.CreateIndex(
                name: "IX_DespachosRestricciones_IdRestriccion",
                table: "DespachosRestricciones",
                column: "IdRestriccion");

            migrationBuilder.CreateIndex(
                name: "IX_DiligenciasAforo_IdDespacho",
                table: "DiligenciasAforo",
                column: "IdDespacho");

            migrationBuilder.CreateIndex(
                name: "IX_DiligenciasAforo_IdUsuario",
                table: "DiligenciasAforo",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_IdEmpresa",
                table: "Documentos",
                column: "IdEmpresa");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_IdTipoDoc",
                table: "Documentos",
                column: "IdTipoDoc");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_IdUsuarioCargador",
                table: "Documentos",
                column: "IdUsuarioCargador");

            migrationBuilder.CreateIndex(
                name: "IX_Documentos_IdUsuarioValidador",
                table: "Documentos",
                column: "IdUsuarioValidador");

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_CodigoOrden",
                table: "Empresas",
                column: "CodigoOrden",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Correo",
                table: "Empresas",
                column: "Correo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_Ruc",
                table: "Empresas",
                column: "Ruc",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EtapasDespacho_IdDespacho_IdTipoEtapa",
                table: "EtapasDespacho",
                columns: new[] { "IdDespacho", "IdTipoEtapa" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EtapasDespacho_IdTipoEtapa",
                table: "EtapasDespacho",
                column: "IdTipoEtapa");

            migrationBuilder.CreateIndex(
                name: "IX_EtapasDespacho_IdUsuarioResponsable",
                table: "EtapasDespacho",
                column: "IdUsuarioResponsable");

            migrationBuilder.CreateIndex(
                name: "IX_FotosAforo_IdDiligencia",
                table: "FotosAforo",
                column: "IdDiligencia");

            migrationBuilder.CreateIndex(
                name: "IX_LogisticasTransporte_IdDespacho",
                table: "LogisticasTransporte",
                column: "IdDespacho",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificacionesEmail_IdDocumento",
                table: "NotificacionesEmail",
                column: "IdDocumento");

            migrationBuilder.CreateIndex(
                name: "IX_NotificacionesEmail_IdUsuarioEmisor",
                table: "NotificacionesEmail",
                column: "IdUsuarioEmisor");

            migrationBuilder.CreateIndex(
                name: "IX_PartidasArancelarias_IdDam",
                table: "PartidasArancelarias",
                column: "IdDam");

            migrationBuilder.CreateIndex(
                name: "IX_RestriccionesLegales_Nombre",
                table: "RestriccionesLegales",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_NombreRol",
                table: "Roles",
                column: "NombreRol",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposDocumento_Nombre",
                table: "TiposDocumento",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposEtapa_Nombre",
                table: "TiposEtapa",
                column: "Nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposEtapa_Orden",
                table: "TiposEtapa",
                column: "Orden",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Correo",
                table: "Usuarios",
                column: "Correo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_IdEmpresa",
                table: "Usuarios",
                column: "IdEmpresa");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_IdRol",
                table: "Usuarios",
                column: "IdRol");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Auditorias");

            migrationBuilder.DropTable(
                name: "ComprobantesPago");

            migrationBuilder.DropTable(
                name: "ContratosServicio");

            migrationBuilder.DropTable(
                name: "DespachosRestricciones");

            migrationBuilder.DropTable(
                name: "EtapasDespacho");

            migrationBuilder.DropTable(
                name: "FotosAforo");

            migrationBuilder.DropTable(
                name: "LogisticasTransporte");

            migrationBuilder.DropTable(
                name: "NotificacionesEmail");

            migrationBuilder.DropTable(
                name: "PartidasArancelarias");

            migrationBuilder.DropTable(
                name: "RestriccionesLegales");

            migrationBuilder.DropTable(
                name: "TiposEtapa");

            migrationBuilder.DropTable(
                name: "DiligenciasAforo");

            migrationBuilder.DropTable(
                name: "Documentos");

            migrationBuilder.DropTable(
                name: "Dams");

            migrationBuilder.DropTable(
                name: "TiposDocumento");

            migrationBuilder.DropTable(
                name: "Despachos");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "CanalesSunat");

            migrationBuilder.DropTable(
                name: "Empresas");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
