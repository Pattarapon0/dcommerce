using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseCurrencyToProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 2, 10, 21, 34, 543, DateTimeKind.Utc).AddTicks(5519),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 1, 16, 51, 4, 141, DateTimeKind.Utc).AddTicks(714));

            migrationBuilder.AddColumn<string>(
                name: "BaseCurrency",
                table: "Products",
                type: "TEXT",
                maxLength: 3,
                nullable: false,
                defaultValue: "THB",
                comment: "Base currency for the product price (ISO 4217 code)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BaseCurrency",
                table: "Products");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 1, 16, 51, 4, 141, DateTimeKind.Utc).AddTicks(714),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 2, 10, 21, 34, 543, DateTimeKind.Utc).AddTicks(5519));
        }
    }
}
