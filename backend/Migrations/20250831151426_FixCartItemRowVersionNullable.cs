using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixCartItemRowVersionNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 15, 14, 25, 762, DateTimeKind.Utc).AddTicks(4622),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 15, 11, 53, 767, DateTimeKind.Utc).AddTicks(9940));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 15, 11, 53, 767, DateTimeKind.Utc).AddTicks(9940),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 15, 14, 25, 762, DateTimeKind.Utc).AddTicks(4622));
        }
    }
}
