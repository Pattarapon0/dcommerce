using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AutoUpdateUserRoleOnSellerProfileChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 15, 8, 46, 0, 803, DateTimeKind.Utc).AddTicks(8202),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 9, 5, 38, 35, 999, DateTimeKind.Utc).AddTicks(9954));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 9, 5, 38, 35, 999, DateTimeKind.Utc).AddTicks(9954),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 15, 8, 46, 0, 803, DateTimeKind.Utc).AddTicks(8202));
        }
    }
}
