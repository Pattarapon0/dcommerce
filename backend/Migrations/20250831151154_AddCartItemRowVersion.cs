using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCartItemRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 15, 11, 53, 767, DateTimeKind.Utc).AddTicks(9940),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 14, 33, 18, 938, DateTimeKind.Utc).AddTicks(8800));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 14, 33, 18, 938, DateTimeKind.Utc).AddTicks(8800),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 15, 11, 53, 767, DateTimeKind.Utc).AddTicks(9940));
        }
    }
}
