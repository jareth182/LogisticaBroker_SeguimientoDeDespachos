using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class Sprint3_ItemFactura_NuevosCampos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UnidadMedida",
                table: "ItemsFactura",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaisOrigen",
                table: "ItemsFactura",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NumCajas",
                table: "ItemsFactura",
                type: "numeric(10,0)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Volumen",
                table: "ItemsFactura",
                type: "numeric(10,3)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PesoBruto",
                table: "ItemsFactura",
                type: "numeric(10,3)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PesoNeto",
                table: "ItemsFactura",
                type: "numeric(10,3)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "UnidadMedida",  table: "ItemsFactura");
            migrationBuilder.DropColumn(name: "PaisOrigen",    table: "ItemsFactura");
            migrationBuilder.DropColumn(name: "NumCajas",      table: "ItemsFactura");
            migrationBuilder.DropColumn(name: "Volumen",       table: "ItemsFactura");
            migrationBuilder.DropColumn(name: "PesoBruto",     table: "ItemsFactura");
            migrationBuilder.DropColumn(name: "PesoNeto",      table: "ItemsFactura");
        }
    }
}
