using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class AddIdDespachoToPartidas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "IdDam",
                table: "PartidasArancelarias",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "IdDespacho",
                table: "PartidasArancelarias",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PartidasArancelarias_IdDespacho",
                table: "PartidasArancelarias",
                column: "IdDespacho");

            migrationBuilder.AddForeignKey(
                name: "FK_PartidasArancelarias_Despachos_IdDespacho",
                table: "PartidasArancelarias",
                column: "IdDespacho",
                principalTable: "Despachos",
                principalColumn: "IdDespacho",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PartidasArancelarias_Despachos_IdDespacho",
                table: "PartidasArancelarias");

            migrationBuilder.DropIndex(
                name: "IX_PartidasArancelarias_IdDespacho",
                table: "PartidasArancelarias");

            migrationBuilder.DropColumn(
                name: "IdDespacho",
                table: "PartidasArancelarias");

            migrationBuilder.AlterColumn<int>(
                name: "IdDam",
                table: "PartidasArancelarias",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
