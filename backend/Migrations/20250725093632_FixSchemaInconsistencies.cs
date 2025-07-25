using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixSchemaInconsistencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "Images",
                table: "Products");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 25, 9, 36, 31, 134, DateTimeKind.Utc).AddTicks(8820),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 25, 9, 26, 30, 434, DateTimeKind.Utc).AddTicks(8709));

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrls",
                table: "Products",
                type: "TEXT",
                nullable: false,
                comment: "JSON array of image URLs for the product",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.CreateTable(
                name: "OAuthStates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    State = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false, comment: "CSRF protection state parameter"),
                    Nonce = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true, comment: "OpenID Connect nonce for replay protection"),
                    Provider = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, comment: "OAuth provider name (e.g., 'google', 'facebook')"),
                    RedirectUri = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true, comment: "OAuth redirect URI for this authorization flow"),
                    CodeChallenge = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true, comment: "PKCE code challenge for enhanced security"),
                    CodeChallengeMethod = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true, defaultValue: "S256", comment: "PKCE code challenge method (S256 recommended)"),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false, comment: "When this OAuth state expires"),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OAuthStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OAuthStates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OAuthStates_ExpiresAt",
                table: "OAuthStates",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_OAuthStates_Provider",
                table: "OAuthStates",
                column: "Provider");

            migrationBuilder.CreateIndex(
                name: "IX_OAuthStates_State",
                table: "OAuthStates",
                column: "State",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OAuthStates_UserId",
                table: "OAuthStates",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OAuthStates");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 25, 9, 26, 30, 434, DateTimeKind.Utc).AddTicks(8709),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 25, 9, 36, 31, 134, DateTimeKind.Utc).AddTicks(8820));

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrls",
                table: "Products",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldComment: "JSON array of image URLs for the product");

            migrationBuilder.AddColumn<string>(
                name: "Images",
                table: "Products",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                comment: "JSON array of image URLs for the product");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId",
                unique: true);
        }
    }
}
