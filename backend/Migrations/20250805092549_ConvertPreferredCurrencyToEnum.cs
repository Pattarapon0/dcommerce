using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ConvertPreferredCurrencyToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add temporary column for enum values
            migrationBuilder.AddColumn<int>(
                name: "PreferredCurrencyTemp",
                table: "Users",
                type: "INTEGER",
                nullable: true);

            // Step 2: Convert existing string values to enum integers
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET PreferredCurrencyTemp = 
                    CASE UPPER(PreferredCurrency)
                        WHEN 'THB' THEN 0
                        WHEN 'USD' THEN 1
                        WHEN 'EUR' THEN 2
                        WHEN 'GBP' THEN 3
                        WHEN 'JPY' THEN 4
                        WHEN 'AUD' THEN 5
                        WHEN 'CAD' THEN 6
                        WHEN 'SGD' THEN 7
                        ELSE 0  -- Default to THB for any unknown values
                    END
                WHERE PreferredCurrency IS NOT NULL");

            // Step 3: Set default for NULL values
            migrationBuilder.Sql("UPDATE Users SET PreferredCurrencyTemp = 0 WHERE PreferredCurrency IS NULL");

            // Step 4: Drop old column
            migrationBuilder.DropColumn(
                name: "PreferredCurrency",
                table: "Users");

            // Step 5: Rename temp column to original name
            migrationBuilder.RenameColumn(
                name: "PreferredCurrencyTemp",
                table: "Users",
                newName: "PreferredCurrency");

            // Step 6: Set proper configuration for the new column
            migrationBuilder.AlterColumn<int>(
                name: "PreferredCurrency",
                table: "Users",
                type: "INTEGER",
                nullable: true,
                defaultValue: 0,
                comment: "User's preferred currency (enum value)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 5, 9, 25, 49, 256, DateTimeKind.Utc).AddTicks(5061),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 2, 10, 21, 34, 543, DateTimeKind.Utc).AddTicks(5519));
        }
        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverse conversion: int back to string
            migrationBuilder.AddColumn<string>(
                name: "PreferredCurrencyTemp",
                table: "Users", 
                type: "TEXT",
                maxLength: 10,
                nullable: true);

            // Convert enum integers back to strings
            migrationBuilder.Sql(@"
                UPDATE Users 
                SET PreferredCurrencyTemp = 
                    CASE PreferredCurrency
                        WHEN 0 THEN 'THB'
                        WHEN 1 THEN 'USD'
                        WHEN 2 THEN 'EUR'
                        WHEN 3 THEN 'GBP'
                        WHEN 4 THEN 'JPY'
                        WHEN 5 THEN 'AUD'
                        WHEN 6 THEN 'CAD'
                        WHEN 7 THEN 'SGD'
                        ELSE 'THB'
                    END");

            migrationBuilder.DropColumn(
                name: "PreferredCurrency",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "PreferredCurrencyTemp",
                table: "Users",
                newName: "PreferredCurrency");

            migrationBuilder.AlterColumn<string>(
                name: "PreferredCurrency",
                table: "Users",
                type: "TEXT",
                maxLength: 10,
                nullable: true,
                defaultValue: "THB",
                comment: "User's preferred currency code (ISO 4217)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLogins",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2025, 8, 2, 10, 21, 34, 543, DateTimeKind.Utc).AddTicks(5519),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2025, 8, 5, 9, 25, 49, 256, DateTimeKind.Utc).AddTicks(5061));
        }    }
}
