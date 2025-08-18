using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyToOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 18, 8, 49, 7, 851, DateTimeKind.Utc).AddTicks(7624),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 18, 8, 40, 31, 46, DateTimeKind.Utc).AddTicks(5961));

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "OrderItems",
                type: "TEXT",
                maxLength: 3,
                nullable: false,
                defaultValue: "THB",
                comment: "Currency for the order item prices (ISO 4217 code)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "OrderItems");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 18, 8, 40, 31, 46, DateTimeKind.Utc).AddTicks(5961),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 18, 8, 49, 7, 851, DateTimeKind.Utc).AddTicks(7624));
        }
    }
}
