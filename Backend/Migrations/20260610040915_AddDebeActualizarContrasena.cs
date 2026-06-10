using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class AddDebeActualizarContrasena : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DebeActualizarContrasena",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DebeActualizarContrasena",
                table: "Usuarios");
        }
    }
}
