using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserProfileSeparation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_UserLogins_Users_UserId",
                table: "UserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_Users_UserId",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_PhoneNumber",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                comment: "Optional username for social features and public display",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "TermsAcceptedAt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Timestamp when terms were accepted",
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "User",
                comment: "User's role in the system (User, Admin, etc.)",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldDefaultValue: "User");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ResetTokenExpiry",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Expiration time for password reset token",
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ResetToken",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Token for password reset - null when not requested",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ProfileCompletedAt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Timestamp when profile was completed",
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "ProfileComplete",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                comment: "Whether user has completed their profile setup",
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "PreferredLanguage",
                table: "Users",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                defaultValue: "en",
                comment: "User's preferred language code (ISO 639-1)",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true,
                oldDefaultValue: "en");

            migrationBuilder.AlterColumn<string>(
                name: "PreferredCurrency",
                table: "Users",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                defaultValue: "USD",
                comment: "User's preferred currency code (ISO 4217)",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true,
                oldDefaultValue: "USD");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "BCrypt hashed password - null for OAuth-only users",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "NewsletterSubscription",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                comment: "Whether user has opted into newsletter subscription",
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLoginAttempt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Timestamp of last login attempt (successful or failed)",
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLogin",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Timestamp of last successful login",
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsVerified",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                comment: "Whether user's email has been verified",
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: true,
                comment: "Whether user account is active - false for deactivated accounts",
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "FailedLoginAttempts",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                comment: "Count of consecutive failed login attempts",
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "TEXT",
                nullable: true,
                comment: "Token for email verification - null when verified",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                comment: "User's primary email address - used for login and communication",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "DeactivationReason",
                table: "Users",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                comment: "Reason for account deactivation - null for active accounts",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "AcceptedTerms",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                comment: "Whether user has accepted terms and conditions",
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Website",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                comment: "User's personal or business website URL",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Timezone",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                defaultValue: "UTC",
                comment: "User's timezone - used for scheduling and time display",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValue: "UTC");

            migrationBuilder.AlterColumn<string>(
                name: "SocialLinks",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                comment: "JSON string containing social media links and handles",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                comment: "Postal/ZIP code - used for shipping calculations",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                comment: "User's phone number - used for two-factor auth and contact",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                comment: "User's last name - collected during registration",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                comment: "User's first name - collected during registration",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 5, 28, 7, 46, 49, 109, DateTimeKind.Utc).AddTicks(3455));

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                comment: "Country name - used for localization and compliance",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                comment: "City name - part of complete address",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                comment: "User's biography or description - used in social features",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AvatarUrl",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                comment: "URL to user's profile picture - can be external or internal storage",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 200,
                nullable: true,
                comment: "Street address - used for shipping and billing",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                comment: "Foreign key to Users table - same as User.Id",
                oldClrType: typeof(Guid),
                oldType: "TEXT");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                comment: "User's date of birth - used for age verification and personalization");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 5, 29, 14, 41, 47, 370, DateTimeKind.Utc).AddTicks(5017),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 5, 28, 7, 46, 49, 111, DateTimeKind.Utc).AddTicks(9913));

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedAt",
                table: "Users",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Status",
                table: "Users",
                columns: new[] { "IsActive", "IsVerified" });

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

            migrationBuilder.AddForeignKey(
                name: "FK_Users_RefreshTokens",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserLogins",
                table: "UserLogins",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_Users",
                table: "UserProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_RefreshTokens",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserLogins",
                table: "UserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProfiles_Users",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_Users_CreatedAt",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Status",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_DateOfBirth",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_FullName",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_Location",
                table: "UserProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserProfiles_PhoneNumber",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "UserProfiles");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true,
                oldComment: "Optional username for social features and public display");

            migrationBuilder.AlterColumn<DateTime>(
                name: "TermsAcceptedAt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Timestamp when terms were accepted");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "User",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldDefaultValue: "User",
                oldComment: "User's role in the system (User, Admin, etc.)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ResetTokenExpiry",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Expiration time for password reset token");

            migrationBuilder.AlterColumn<string>(
                name: "ResetToken",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Token for password reset - null when not requested");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ProfileCompletedAt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Timestamp when profile was completed");

            migrationBuilder.AlterColumn<bool>(
                name: "ProfileComplete",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false,
                oldComment: "Whether user has completed their profile setup");

            migrationBuilder.AlterColumn<string>(
                name: "PreferredLanguage",
                table: "Users",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                defaultValue: "en",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true,
                oldDefaultValue: "en",
                oldComment: "User's preferred language code (ISO 639-1)");

            migrationBuilder.AlterColumn<string>(
                name: "PreferredCurrency",
                table: "Users",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                defaultValue: "USD",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldNullable: true,
                oldDefaultValue: "USD",
                oldComment: "User's preferred currency code (ISO 4217)");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "BCrypt hashed password - null for OAuth-only users");

            migrationBuilder.AlterColumn<bool>(
                name: "NewsletterSubscription",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false,
                oldComment: "Whether user has opted into newsletter subscription");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLoginAttempt",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Timestamp of last login attempt (successful or failed)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastLogin",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Timestamp of last successful login");

            migrationBuilder.AlterColumn<bool>(
                name: "IsVerified",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false,
                oldComment: "Whether user's email has been verified");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: true,
                oldComment: "Whether user account is active - false for deactivated accounts");

            migrationBuilder.AlterColumn<int>(
                name: "FailedLoginAttempts",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldDefaultValue: 0,
                oldComment: "Count of consecutive failed login attempts");

            migrationBuilder.AlterColumn<string>(
                name: "EmailVerificationToken",
                table: "Users",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "Token for email verification - null when verified");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "TEXT",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 255,
                oldComment: "User's primary email address - used for login and communication");

            migrationBuilder.AlterColumn<string>(
                name: "DeactivationReason",
                table: "Users",
                type: "TEXT",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 500,
                oldNullable: true,
                oldComment: "Reason for account deactivation - null for active accounts");

            migrationBuilder.AlterColumn<bool>(
                name: "AcceptedTerms",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldDefaultValue: false,
                oldComment: "Whether user has accepted terms and conditions");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Website",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User's personal or business website URL");

            migrationBuilder.AlterColumn<string>(
                name: "Timezone",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 50,
                nullable: true,
                defaultValue: "UTC",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValue: "UTC",
                oldComment: "User's timezone - used for scheduling and time display");

            migrationBuilder.AlterColumn<string>(
                name: "SocialLinks",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "JSON string containing social media links and handles");

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true,
                oldComment: "Postal/ZIP code - used for shipping calculations");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 20,
                oldNullable: true,
                oldComment: "User's phone number - used for two-factor auth and contact");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User's last name - collected during registration");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User's first name - collected during registration");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 5, 28, 7, 46, 49, 109, DateTimeKind.Utc).AddTicks(3455),
                oldClrType: typeof(DateTime),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "Country name - used for localization and compliance");

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "City name - part of complete address");

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "User's biography or description - used in social features");

            migrationBuilder.AlterColumn<string>(
                name: "AvatarUrl",
                table: "UserProfiles",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true,
                oldComment: "URL to user's profile picture - can be external or internal storage");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 200,
                oldNullable: true,
                oldComment: "Street address - used for shipping and billing");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "UserProfiles",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "TEXT",
                oldComment: "Foreign key to Users table - same as User.Id");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 5, 28, 7, 46, 49, 111, DateTimeKind.Utc).AddTicks(9913),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 5, 29, 14, 41, 47, 370, DateTimeKind.Utc).AddTicks(5017));

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_PhoneNumber",
                table: "UserProfiles",
                column: "PhoneNumber",
                filter: "PhoneNumber IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_Users_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserLogins_Users_UserId",
                table: "UserLogins",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProfiles_Users_UserId",
                table: "UserProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
