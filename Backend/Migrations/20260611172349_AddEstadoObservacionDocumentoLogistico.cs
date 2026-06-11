using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class AddEstadoObservacionDocumentoLogistico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Estado",
                table: "DocumentosLogisticos",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "En revisión");

            migrationBuilder.AddColumn<string>(
                name: "Observacion",
                table: "DocumentosLogisticos",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "DocumentosLogisticos");

            migrationBuilder.DropColumn(
                name: "Observacion",
                table: "DocumentosLogisticos");
        }
    }
}
