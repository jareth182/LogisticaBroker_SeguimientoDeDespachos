using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class Sprint2_DocumentoLogistico_ItemFactura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentosLogisticos",
                columns: table => new
                {
                    IdDocumentoLogistico = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    TipoDocumento = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    NombreArchivo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RutaArchivo = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    TamanoBytes = table.Column<long>(type: "bigint", nullable: false),
                    FechaCarga = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdUsuarioCargador = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosLogisticos", x => x.IdDocumentoLogistico);
                    table.ForeignKey(
                        name: "FK_DocumentosLogisticos_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentosLogisticos_Usuarios_IdUsuarioCargador",
                        column: x => x.IdUsuarioCargador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemsFactura",
                columns: table => new
                {
                    IdItem = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdDespacho = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Cantidad = table.Column<decimal>(type: "numeric(12,3)", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Peso = table.Column<decimal>(type: "numeric(10,3)", nullable: false),
                    PartidaArancelaria = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TieneRestriccion = table.Column<bool>(type: "boolean", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioModificacion = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemsFactura", x => x.IdItem);
                    table.ForeignKey(
                        name: "FK_ItemsFactura_Despachos_IdDespacho",
                        column: x => x.IdDespacho,
                        principalTable: "Despachos",
                        principalColumn: "IdDespacho",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosLogisticos_IdDespacho",
                table: "DocumentosLogisticos",
                column: "IdDespacho");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosLogisticos_IdUsuarioCargador",
                table: "DocumentosLogisticos",
                column: "IdUsuarioCargador");

            migrationBuilder.CreateIndex(
                name: "IX_ItemsFactura_IdDespacho",
                table: "ItemsFactura",
                column: "IdDespacho");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentosLogisticos");

            migrationBuilder.DropTable(
                name: "ItemsFactura");
        }
    }
}
