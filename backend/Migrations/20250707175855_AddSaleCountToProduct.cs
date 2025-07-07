using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleCountToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 7, 17, 58, 54, 712, DateTimeKind.Utc).AddTicks(1634),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 5, 16, 26, 36, 69, DateTimeKind.Utc).AddTicks(6960));

            migrationBuilder.AddColumn<int>(
                name: "SalesCount",
                table: "Products",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                comment: "Number of times the product has been sold");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalesCount",
                table: "Products");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 5, 16, 26, 36, 69, DateTimeKind.Utc).AddTicks(6960),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 7, 17, 58, 54, 712, DateTimeKind.Utc).AddTicks(1634));
        }
    }
}
