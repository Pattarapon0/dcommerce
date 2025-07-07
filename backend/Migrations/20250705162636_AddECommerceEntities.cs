using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddECommerceEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false, comment: "User's primary email address - used for login and communication"),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true, comment: "BCrypt hashed password - null for OAuth-only users"),
                    PreferredLanguage = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true, defaultValue: "th", comment: "User's preferred language code (ISO 639-1)"),
                    PreferredCurrency = table.Column<string>(type: "TEXT", maxLength: 10, nullable: true, defaultValue: "THB", comment: "User's preferred currency code (ISO 4217)"),
                    Username = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true, comment: "Optional username for social features and public display"),
                    EmailVerificationToken = table.Column<string>(type: "TEXT", nullable: true, comment: "Token for email verification - null when verified"),
                    IsVerified = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false, comment: "Whether user's email has been verified"),
                    ResetToken = table.Column<string>(type: "TEXT", nullable: true, comment: "Token for password reset - null when not requested"),
                    ResetTokenExpiry = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "Expiration time for password reset token"),
                    Role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false, defaultValue: "Buyer", comment: "User's role in the system (Buyer, Seller, etc.)"),
                    FailedLoginAttempts = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0, comment: "Count of consecutive failed login attempts"),
                    LastLoginAttempt = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "Timestamp of last login attempt (successful or failed)"),
                    LastLogin = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "Timestamp of last successful login"),
                    AcceptedTerms = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false, comment: "Whether user has accepted terms and conditions"),
                    TermsAcceptedAt = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "Timestamp when terms were accepted"),
                    NewsletterSubscription = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false, comment: "Whether user has opted into newsletter subscription"),
                    DeactivationReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true, comment: "Reason for account deactivation - null for active accounts"),
                    BecameSellerAt = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "Timestamp when user became a seller - null for buyers"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true, comment: "Whether user account is active - false for deactivated accounts")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OrderNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, comment: "UNIQUE, Format: O-YYYYMMDD-NNN"),
                    BuyerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubTotal = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Total price of all items before tax and shipping"),
                    Total = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Total price of the order including tax and shipping"),
                    Tax = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Total tax applied to the order"),
                    ShippingAddressSnapshot = table.Column<string>(type: "TEXT", nullable: false, comment: "JSON shipping address for the order"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Orders",
                        column: x => x.BuyerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SellerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false, comment: "Name of the product, max length 200 characters"),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false, comment: "Description of the product, max length 2000 characters"),
                    Price = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Price of the product"),
                    Category = table.Column<string>(type: "TEXT", nullable: false, comment: "Category of the product, stored as string"),
                    Stock = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0, comment: "Stock quantity of the product, must be greater than or equal to 0"),
                    ImageUrls = table.Column<string>(type: "TEXT", nullable: false),
                    Images = table.Column<string>(type: "TEXT", nullable: false, comment: "JSON array of image URLs for the product"),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true, comment: "Indicates whether the product is active"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Products",
                        column: x => x.SellerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Token = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IsRevoked = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    ReplacedByToken = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    ReasonRevoked = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    DeviceId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    IpAddress = table.Column<string>(type: "TEXT", maxLength: 45, nullable: true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_RefreshTokens",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SellerProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false, comment: "Foreign key to Users table - same as User.Id"),
                    BusinessName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false, comment: "Name of the seller's business"),
                    BusinessDescription = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false, comment: "Optional description of the seller's business"),
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_SellerProfiles",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAddresses",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false, comment: "Foreign key to Users table - same as User.Id"),
                    AddressLine1 = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false, comment: "Primary address line - required for all users"),
                    AddressLine2 = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true, comment: "Secondary address line - optional"),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false, comment: "City - required for all users"),
                    State = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false, comment: "State - required for all users"),
                    PostalCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false, comment: "Postal code - required for all users"),
                    Country = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false, defaultValue: "Thailand", comment: "Country - required for all users"),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true, comment: "Phone number - optional"),
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAddresses", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserAddresses_Users",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLogins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Provider = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ProviderKey = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AccessToken = table.Column<string>(type: "TEXT", nullable: true),
                    RefreshTokenOAuth = table.Column<string>(type: "TEXT", nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Scope = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    TokenType = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true, defaultValue: "Bearer"),
                    LastProfileSync = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AutoSyncProfile = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValue: new DateTime(2025, 7, 5, 16, 26, 36, 69, DateTimeKind.Utc).AddTicks(6960)),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLogins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_UserLogins",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false, comment: "Foreign key to Users table - same as User.Id"),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true, comment: "User's first name - collected during registration"),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true, comment: "User's last name - collected during registration"),
                    PhoneNumber = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true, comment: "User's phone number - used for two-factor auth and contact"),
                    DateOfBirth = table.Column<DateTime>(type: "TEXT", nullable: true, comment: "User's date of birth - used for age verification and personalization"),
                    Address = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true, comment: "Street address - used for shipping and billing"),
                    City = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true, comment: "City name - part of complete address"),
                    Country = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true, comment: "Country name - used for localization and compliance"),
                    PostalCode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true, comment: "Postal/ZIP code - used for shipping calculations"),
                    AvatarUrl = table.Column<string>(type: "TEXT", nullable: true, comment: "URL to user's profile picture - can be external or internal storage"),
                    Bio = table.Column<string>(type: "TEXT", nullable: true, comment: "User's biography or description - used in social features"),
                    Website = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true, comment: "User's personal or business website URL"),
                    Timezone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true, defaultValue: "UTC", comment: "User's timezone - used for scheduling and time display"),
                    SocialLinks = table.Column<string>(type: "TEXT", nullable: true, comment: "JSON string containing social media links and handles"),
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false, comment: "Foreign key to Users table - same as User.Id"),
                    ProductId = table.Column<Guid>(type: "TEXT", nullable: false, comment: "Foreign key to Products table - same as Product.Id"),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1, comment: "Quantity of the product in the cart item"),
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => new { x.UserId, x.ProductId });
                    table.ForeignKey(
                        name: "FK_CartItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_CartItems",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OrderId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SellerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProductName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false, comment: "Name of the product in the order item, max length 200 characters"),
                    ProductImageUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false, comment: "URL of the product image in the order item, max length 500 characters"),
                    PriceAtOrderTime = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Price of the product at the time of order, stored with precision 18,2"),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 1, comment: "Quantity of the product in the order item, default is 1"),
                    LineTotal = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false, defaultValue: 0m, comment: "Total price for this order item (PriceAtOrderTime * Quantity), stored with precision 18,2"),
                    Status = table.Column<string>(type: "TEXT", nullable: false, comment: "Status of the order item, stored as string"),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_ProductId",
                table: "CartItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_UserId",
                table: "CartItems",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_UserId_ProductId",
                table: "CartItems",
                columns: new[] { "UserId", "ProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ProductId",
                table: "OrderItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_SellerId",
                table: "OrderItems",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_BuyerId",
                table: "Orders",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderNumber",
                table: "Orders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_SellerId",
                table: "Products",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_IsRevoked",
                table: "RefreshTokens",
                column: "IsRevoked",
                filter: "IsRevoked = 0");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId_ExpiresAt_IsRevoked",
                table: "RefreshTokens",
                columns: new[] { "UserId", "ExpiresAt", "IsRevoked" },
                filter: "IsRevoked = 0");

            migrationBuilder.CreateIndex(
                name: "IX_SellerProfiles_UserId",
                table: "SellerProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAddresses_UserId",
                table: "UserAddresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_LastUsedAt",
                table: "UserLogins",
                column: "LastUsedAt",
                filter: "LastUsedAt IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_Provider_ProviderKey",
                table: "UserLogins",
                columns: new[] { "Provider", "ProviderKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserLogins_UserId",
                table: "UserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_DateOfBirth",
                table: "UserProfiles",
                column: "DateOfBirth",
                filter: "[DateOfBirth] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_FullName",
                table: "UserProfiles",
                columns: new[] { "FirstName", "LastName" },
                filter: "[FirstName] IS NOT NULL AND [LastName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_Location",
                table: "UserProfiles",
                columns: new[] { "Country", "City" },
                filter: "[Country] IS NOT NULL AND [City] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_PhoneNumber",
                table: "UserProfiles",
                column: "PhoneNumber",
                filter: "[PhoneNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedAt",
                table: "Users",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_EmailVerificationToken",
                table: "Users",
                column: "EmailVerificationToken",
                filter: "[EmailVerificationToken] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ResetToken",
                table: "Users",
                column: "ResetToken",
                filter: "[ResetToken] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Status",
                table: "Users",
                columns: new[] { "IsActive", "IsVerified" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true,
                filter: "[Username] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "SellerProfiles");

            migrationBuilder.DropTable(
                name: "UserAddresses");

            migrationBuilder.DropTable(
                name: "UserLogins");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
