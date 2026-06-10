using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LogisticaBroker.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenRecuperacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TokenExpiracionUtc",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TokenRecuperacion",
                table: "Usuarios",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenExpiracionUtc",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TokenRecuperacion",
                table: "Usuarios");
        }
    }
}
