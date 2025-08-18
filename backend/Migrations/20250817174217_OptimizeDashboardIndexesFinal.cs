using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeDashboardIndexesFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 17, 17, 42, 17, 52, DateTimeKind.Utc).AddTicks(5978),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 17, 11, 22, 31, 787, DateTimeKind.Utc).AddTicks(2880));

            migrationBuilder.CreateIndex(
                name: "IX_Products_Dashboard_Query",
                table: "Products",
                columns: new[] { "SellerId", "IsActive", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_SellerId_Stock",
                table: "Products",
                columns: new[] { "SellerId", "Stock" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Dashboard_Query",
                table: "OrderItems",
                columns: new[] { "SellerId", "CreatedAt", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Status",
                table: "OrderItems",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_Dashboard_Query",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_SellerId_Stock",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_Dashboard_Query",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_Status",
                table: "OrderItems");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 17, 11, 22, 31, 787, DateTimeKind.Utc).AddTicks(2880),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 17, 17, 42, 17, 52, DateTimeKind.Utc).AddTicks(5978));
        }
    }
}
