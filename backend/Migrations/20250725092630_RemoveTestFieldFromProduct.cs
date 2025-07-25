using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTestFieldFromProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TestField",
                table: "Products");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 25, 9, 26, 30, 434, DateTimeKind.Utc).AddTicks(8709),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 25, 9, 25, 4, 501, DateTimeKind.Utc).AddTicks(8249));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 25, 9, 25, 4, 501, DateTimeKind.Utc).AddTicks(8249),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 25, 9, 26, 30, 434, DateTimeKind.Utc).AddTicks(8709));

            migrationBuilder.AddColumn<string>(
                name: "TestField",
                table: "Products",
                type: "TEXT",
                maxLength: 100,
                nullable: true);
        }
    }
}
