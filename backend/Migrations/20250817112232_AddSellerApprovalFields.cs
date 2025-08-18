using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSellerApproved",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SellerApprovalNotes",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SellerApprovedAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SellerRejectionReason",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 17, 11, 22, 31, 787, DateTimeKind.Utc).AddTicks(2880),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 15, 8, 46, 0, 803, DateTimeKind.Utc).AddTicks(8202));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSellerApproved",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SellerApprovalNotes",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SellerApprovedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SellerRejectionReason",
                table: "Users");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 15, 8, 46, 0, 803, DateTimeKind.Utc).AddTicks(8202),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 17, 11, 22, 31, 787, DateTimeKind.Utc).AddTicks(2880));
        }
    }
}
