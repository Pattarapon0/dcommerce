using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class MakeCartItemRowVersionNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 15, 18, 5, 907, DateTimeKind.Utc).AddTicks(2662),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 15, 14, 25, 762, DateTimeKind.Utc).AddTicks(4622));

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "CartItems",
                type: "bytea",
                rowVersion: true,
                nullable: true,
                comment: "Concurrency control token",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldComment: "Concurrency control token");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 31, 15, 14, 25, 762, DateTimeKind.Utc).AddTicks(4622),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValue: new DateTime(2025, 8, 31, 15, 18, 5, 907, DateTimeKind.Utc).AddTicks(2662));

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "CartItems",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0],
                comment: "Concurrency control token",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldNullable: true,
                oldComment: "Concurrency control token");
        }
    }
}
