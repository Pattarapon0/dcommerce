using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixProfileValidationConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                comment: "User's last name - collected during registration",
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
                nullable: false,
                defaultValue: "",
                comment: "User's first name - collected during registration",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User's first name - collected during registration");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "UserProfiles",
                type: "TEXT",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                comment: "Country name - used for localization and compliance",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "Country name - used for localization and compliance");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 1, 15, 27, 2, 200, DateTimeKind.Utc).AddTicks(4839),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 7, 25, 9, 36, 31, 134, DateTimeKind.Utc).AddTicks(8820));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                oldComment: "User's last name - collected during registration");

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
                oldComment: "User's first name - collected during registration");

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
                oldComment: "Country name - used for localization and compliance");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 7, 25, 9, 36, 31, 134, DateTimeKind.Utc).AddTicks(8820),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 1, 15, 27, 2, 200, DateTimeKind.Utc).AddTicks(4839));
        }
    }
}
