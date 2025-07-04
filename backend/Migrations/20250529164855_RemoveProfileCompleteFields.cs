using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProfileCompleteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileComplete",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfileCompletedAt",
                table: "Users");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 5, 29, 16, 48, 54, 871, DateTimeKind.Utc).AddTicks(2612),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 5, 29, 16, 33, 10, 504, DateTimeKind.Utc).AddTicks(2912));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ProfileComplete",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                comment: "Whether user has completed their profile setup");

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfileCompletedAt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Timestamp when profile was completed");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 5, 29, 16, 33, 10, 504, DateTimeKind.Utc).AddTicks(2912),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 5, 29, 16, 48, 54, 871, DateTimeKind.Utc).AddTicks(2612));
        }
    }
}
