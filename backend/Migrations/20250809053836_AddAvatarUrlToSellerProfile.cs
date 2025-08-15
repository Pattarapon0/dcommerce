using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarUrlToSellerProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 9, 5, 38, 35, 999, DateTimeKind.Utc).AddTicks(9954),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 6, 17, 6, 6, 185, DateTimeKind.Utc).AddTicks(8515));

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "SellerProfiles",
                type: "TEXT",
                nullable: true,
                comment: "URL for the seller's business profile picture");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "SellerProfiles");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 6, 17, 6, 6, 185, DateTimeKind.Utc).AddTicks(8515),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 9, 5, 38, 35, 999, DateTimeKind.Utc).AddTicks(9954));
        }
    }
}
