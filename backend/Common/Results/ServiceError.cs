using LanguageExt.Common;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using FluentValidation.Results;
using static LanguageExt.Prelude;
namespace backend.Common.Results;

public record ServiceError : Error
{
    private readonly string _code;
    private readonly ServiceCategory _category;

    private ServiceError(string code, string message, int statusCode, ServiceCategory category = ServiceCategory.General, Dictionary<string, string[]>? errors = null)
    {
        _code = code;
        Message = message;
        StatusCode = statusCode;
        _category = category;
        Errors = errors;
    }
    public enum ServiceCategory
    {
        General,
        Authentication,
        Token,
        Password,
        Database,
        Validation,
        Product,
        Image,
    }
    // Core properties for API responses (serialized by custom converter)
    public string ErrorCode => _code;
    public override string Message { get; }
    public int StatusCode { get; }
    public ServiceCategory Category => _category;

    // NEW: Optional field errors for validation (null for non-validation errors)
    public Dictionary<string, string[]>? Errors { get; init; }
    // Required overrides for LanguageExt.Error
    public override int Code => StatusCode;
    public override bool IsExpected => true;
    public override bool IsExceptional => false;
    public override Exception ToException() => new ServiceErrorException(this);
    public override ErrorException ToErrorException() => new ServiceErrorException(this);

    // Utility properties for internal use
    public bool IsClientError => StatusCode >= 400 && StatusCode < 500;
    public bool IsbackendError => StatusCode >= 500;
    public bool IsAuthenticationError => _category == ServiceCategory.Authentication || _category == ServiceCategory.Token;

    // NEW: Helper for checking if error has field validation
    public bool HasFieldErrors => Errors?.Any() == true;
    // Logging support
    public string ToLogString() => $"[{_category}] {_code}: {Message} (Status: {StatusCode})";

    public static ServiceError FromException(Exception ex) => ex switch
    {
        // JWT-specific exceptions
        SecurityTokenExpiredException _ =>
            TokenExpired(),

        SecurityTokenInvalidSignatureException _ =>
            InvalidTokenSignature(),

        SecurityTokenMalformedException _ =>
            InvalidTokenFormat(),

        SecurityTokenNotYetValidException _ =>
            new("TOKEN_NOT_YET_VALID", "Token is not yet valid", 401, ServiceCategory.Token),

        SecurityTokenValidationException tokenEx =>
            new("TOKEN_VALIDATION_FAILED", tokenEx.Message, 401, ServiceCategory.Token),

        // BCrypt exceptions
        BCrypt.Net.SaltParseException _ =>
            PasswordHashFailed(),

        BCrypt.Net.HashInformationException _ =>
            PasswordHashFailed(),

        // Database exceptions with enhanced logging
        DbUpdateException dbEx when IsUniqueConstraintViolation(dbEx) =>
            FromUniqueConstraintViolation(dbEx),

        DbUpdateException dbEx when IsForeignKeyViolation(dbEx) =>
            FromForeignKeyViolation(dbEx),

        DbUpdateException dbEx when IsCheckConstraintViolation(dbEx) =>
            FromCheckConstraintViolation(dbEx),

        DbUpdateException dbEx when IsNullConstraintViolation(dbEx) =>
            FromNullConstraintViolation(dbEx),

        // Log unhandled DbUpdateExceptions to help debug
        DbUpdateException dbEx =>
            Internal($"Database error - Inner: '{dbEx.InnerException?.Message}' - Outer: '{dbEx.Message}' - Type: '{dbEx.InnerException?.GetType().Name}'"),

        InvalidOperationException opEx =>
            new("INVALID_OPERATION", opEx.Message, 400, ServiceCategory.Validation),

        TimeoutException _ =>
            Internal("Database operation timed out"),

        OperationCanceledException _ =>
            Internal("Operation was cancelled"),

        Exception dbEx when dbEx.GetType().Name.Contains("SqlException") =>
            Internal($"Database error: {dbEx.Message}"),

        _ => Internal($"An unexpected error occurred: {ex.Message}")
    };

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        // Check if it's a SQL Server unique constraint violation  
        if (ex.InnerException?.GetType().Name.Contains("SqlException") == true)
        {
            // Use reflection to check SQL Server error code 2627 for unique constraint violation
            var numberProperty = ex.InnerException.GetType().GetProperty("Number");
            if (numberProperty?.GetValue(ex.InnerException) is int errorNumber)
            {
                return errorNumber == 2627;
            }
        }
        
        // Fallback to message checking for other databases
        var message = ex.InnerException?.Message ?? ex.Message;
        return message.Contains("duplicate key value violates unique constraint") ||
               message.Contains("UNIQUE constraint");
    }

    private static bool IsForeignKeyViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("FOREIGN KEY constraint") ?? false;

    private static bool IsCheckConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("CHECK constraint") ?? false;

    private static bool IsNullConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("NOT NULL constraint") ?? false;

    // Enhanced unique constraint violation handler with field-level errors
    private static ServiceError FromUniqueConstraintViolation(DbUpdateException ex)
    {
        var errorMessage = ex.InnerException?.Message ?? ex.Message;
        
        // Try to extract field information from common constraint patterns
        var fieldInfo = ExtractConstraintFieldInfo(errorMessage);
        
        if (fieldInfo != null)
        {
            return new ServiceError(
                code: "VALIDATION_FAILED",
                message: $"{fieldInfo.FieldDisplayName} already exists",
                statusCode: 409,
                category: ServiceCategory.Validation,
                errors: new Dictionary<string, string[]>
                {
                    [fieldInfo.FieldName.ToCamelCase()] = [$"This {fieldInfo.FieldDisplayName.ToLowerInvariant()} is already taken"]
                }
            );
        }

        // Fallback to generic conflict error if we can't extract field info
        return Conflict("A record with this information already exists");
    }

    // Enhanced foreign key constraint violation handler with field-level errors
    private static ServiceError FromForeignKeyViolation(DbUpdateException ex)
    {
        var errorMessage = ex.InnerException?.Message ?? ex.Message;
        
        // Try to extract field information from foreign key constraint patterns
        var fieldInfo = ExtractForeignKeyFieldInfo(errorMessage);
        
        if (fieldInfo != null)
        {
            return new ServiceError(
                code: "VALIDATION_FAILED",
                message: $"Invalid {fieldInfo.FieldDisplayName}",
                statusCode: 400,
                category: ServiceCategory.Validation,
                errors: new Dictionary<string, string[]>
                {
                    [fieldInfo.FieldName.ToCamelCase()] = [$"Please select a valid {fieldInfo.FieldDisplayName.ToLowerInvariant()}"]
                }
            );
        }

        // Fallback to generic error if we can't extract field info
        return new("INVALID_REFERENCE", "Invalid reference to related entity", 400, ServiceCategory.Validation);
    }

    // Enhanced check constraint violation handler with field-level errors
    private static ServiceError FromCheckConstraintViolation(DbUpdateException ex)
    {
        var errorMessage = ex.InnerException?.Message ?? ex.Message;
        
        // Try to extract field information from check constraint patterns
        var fieldInfo = ExtractCheckConstraintFieldInfo(errorMessage);
        
        if (fieldInfo != null)
        {
            return new ServiceError(
                code: "VALIDATION_FAILED",
                message: $"Invalid {fieldInfo.FieldDisplayName}",
                statusCode: 400,
                category: ServiceCategory.Validation,
                errors: new Dictionary<string, string[]>
                {
                    [fieldInfo.FieldName.ToCamelCase()] = [fieldInfo.ErrorMessage ?? $"Invalid {fieldInfo.FieldDisplayName.ToLowerInvariant()}"]
                }
            );
        }

        // Fallback to generic error if we can't extract field info
        return new("DATA_VALIDATION_FAILED", "Data validation failed", 400, ServiceCategory.Validation);
    }

    // Enhanced null constraint violation handler with field-level errors
    private static ServiceError FromNullConstraintViolation(DbUpdateException ex)
    {
        var errorMessage = ex.InnerException?.Message ?? ex.Message;
        
        // Try to extract field information from null constraint patterns
        var fieldInfo = ExtractNullConstraintFieldInfo(errorMessage);
        
        if (fieldInfo != null)
        {
            return new ServiceError(
                code: "VALIDATION_FAILED",
                message: $"{fieldInfo.FieldDisplayName} is required",
                statusCode: 400,
                category: ServiceCategory.Validation,
                errors: new Dictionary<string, string[]>
                {
                    [fieldInfo.FieldName.ToCamelCase()] = [$"{fieldInfo.FieldDisplayName} is required"]
                }
            );
        }

        // Fallback to generic error if we can't extract field info
        return new("REQUIRED_DATA_MISSING", "Required data is missing", 400, ServiceCategory.Validation);
    }

    // Helper to extract field information from constraint violation messages
    private static ConstraintFieldInfo? ExtractConstraintFieldInfo(string errorMessage)
    {
        // Common patterns for different databases:
        // PostgreSQL: duplicate key value violates unique constraint "IX_Users_Email"
        // SQL Server: Violation of UNIQUE KEY constraint 'IX_Users_Email'
        // SQLite: UNIQUE constraint failed: Users.Email
        
        // SQL Server pattern (check first since it's our primary database)
        if (errorMessage.Contains("UNIQUE KEY constraint"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"UNIQUE KEY constraint 'IX_\w+_(\w+)'", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }
        
        // PostgreSQL pattern (fallback)
        if (errorMessage.Contains("duplicate key value violates unique constraint"))
        {
            // Handle composite constraints like IX_CartItems_UserId_ProductId
            var compositeMatch = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"unique constraint ""IX_CartItems_UserId_ProductId""", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (compositeMatch.Success)
            {
                return new ConstraintFieldInfo("product", "Product", "This product is already in your cart");
            }

            // Handle specific known constraints by exact name (without quotes in the check)
            if (errorMessage.Contains("IX_Users_Email"))
            {
                return new ConstraintFieldInfo("email", GetFieldDisplayName("email"));
            }
            
            if (errorMessage.Contains("IX_Users_Username"))
            {
                return new ConstraintFieldInfo("username", GetFieldDisplayName("username"));
            }
            
            // Fallback: generic pattern for any other IX_Table_Field constraints
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"unique constraint ""IX_(\w+)_(\w+)""", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var tableName = match.Groups[1].Value;
                var fieldName = match.Groups[2].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }
        
        // SQLite pattern
        if (errorMessage.Contains("UNIQUE constraint failed"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"UNIQUE constraint failed: \w+\.(\w+)", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }
        
        // SQL Server pattern
        if (errorMessage.Contains("UNIQUE KEY constraint"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"UNIQUE KEY constraint 'IX_\w+_(\w+)'", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }

        return null;
    }

    // Helper to extract field information from foreign key constraint violation messages
    private static ConstraintFieldInfo? ExtractForeignKeyFieldInfo(string errorMessage)
    {
        // Common patterns for foreign key violations:
        // PostgreSQL: insert or update on table "CartItems" violates foreign key constraint "FK_CartItems_Products_ProductId"
        // SQL Server: The INSERT statement conflicted with the FOREIGN KEY constraint "FK_CartItems_Products_ProductId"
        // SQLite: FOREIGN KEY constraint failed
        
        // PostgreSQL/SQL Server pattern - try to extract field from constraint name
        var fkMatch = System.Text.RegularExpressions.Regex.Match(
            errorMessage, 
            @"FK_\w+_\w+_(\w+)", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
        
        if (fkMatch.Success)
        {
            var fieldName = fkMatch.Groups[1].Value;
            return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
        }

        // Alternative pattern: constraint name like "FK_TableName_FieldName"
        var fkMatch2 = System.Text.RegularExpressions.Regex.Match(
            errorMessage, 
            @"FK_\w+_(\w+)", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
        
        if (fkMatch2.Success)
        {
            var fieldName = fkMatch2.Groups[1].Value;
            // Skip if it looks like a table name (ends with 's' and is long)
            if (fieldName.Length > 6 && fieldName.EndsWith("s"))
                return null;
                
            return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
        }

        return null;
    }

    // Helper to extract field information from check constraint violation messages  
    private static ConstraintFieldInfo? ExtractCheckConstraintFieldInfo(string errorMessage)
    {
        // Common patterns for check constraints:
        // PostgreSQL: new row for relation "Products" violates check constraint "CK_Products_Price_NonNegative"
        // SQL Server: The INSERT statement conflicted with the CHECK constraint "CK_Products_Price_NonNegative"
        
        var checkMatch = System.Text.RegularExpressions.Regex.Match(
            errorMessage, 
            @"CK_\w+_(\w+)", 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
        
        if (checkMatch.Success)
        {
            var fieldName = checkMatch.Groups[1].Value;
            var displayName = GetFieldDisplayName(fieldName);
            var errorMsg = GetCheckConstraintErrorMessage(fieldName);
            
            return new ConstraintFieldInfo(fieldName, displayName, errorMsg);
        }

        return null;
    }

    // Helper to extract field information from null constraint violation messages
    private static ConstraintFieldInfo? ExtractNullConstraintFieldInfo(string errorMessage)
    {
        // Common patterns for null constraints:
        // PostgreSQL: null value in column "Email" violates not-null constraint
        // SQL Server: Cannot insert the value NULL into column 'Email'
        // SQLite: NOT NULL constraint failed: Users.Email
        
        // PostgreSQL pattern
        if (errorMessage.Contains("null value in column"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"null value in column ""(\w+)""", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }
        
        // SQL Server pattern
        if (errorMessage.Contains("Cannot insert the value NULL"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"Cannot insert the value NULL into column '(\w+)'", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }
        
        // SQLite pattern
        if (errorMessage.Contains("NOT NULL constraint failed"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(
                errorMessage, 
                @"NOT NULL constraint failed: \w+\.(\w+)", 
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            if (match.Success)
            {
                var fieldName = match.Groups[1].Value;
                return new ConstraintFieldInfo(fieldName, GetFieldDisplayName(fieldName));
            }
        }

        return null;
    }

    // Helper to get appropriate error messages for check constraints
    private static string GetCheckConstraintErrorMessage(string fieldName) => fieldName.ToLowerInvariant() switch
    {
        "price" => "Price must be greater than or equal to 0",
        "quantity" => "Quantity must be greater than 0", 
        "stock" => "Stock cannot be negative",
        _ => $"{GetFieldDisplayName(fieldName)} has an invalid value"
    };

    // Convert technical field names to user-friendly display names
    private static string GetFieldDisplayName(string fieldName) => fieldName.ToLowerInvariant() switch
    {
        // Actual fields from User entity
        "email" => "Email address",
        "username" => "Username",
        
        // Actual fields from Product entity  
        "name" => "Product name",
        "price" => "Price",
        "stock" => "Stock",
        "quantity" => "Quantity",
        
        // Actual fields from SellerProfile entity
        "businessname" => "Business name",
        
        // Generic references for foreign keys
        "product" => "Product",
        "user" => "User",
        "seller" => "Seller",
        
        _ => fieldName // Default to field name if no mapping found
    };

    // Helper record for constraint field information
    private record ConstraintFieldInfo(string FieldName, string FieldDisplayName, string? ErrorMessage = null);

    // Generic error methods with improved error codes
    public static ServiceError NotFound(string entity, string detail) =>
        new($"{entity.ToUpperInvariant()}_NOT_FOUND", $"{entity} with {detail} not found", 404, ServiceCategory.Database, null);

    public static ServiceError AlreadyExists(string entity, string detail) =>
        new($"{entity.ToUpperInvariant()}_ALREADY_EXISTS", $"{entity} with {detail} already exists", 409, ServiceCategory.Database, null);

    public static ServiceError Conflict(string message) =>
        new("RESOURCE_CONFLICT", message, 409, ServiceCategory.Database, null);

    public static ServiceError Validation(string message) =>
        new("REQUIRED_FIELDS_MISSING", message, 400, ServiceCategory.Validation, null);

    public static ServiceError Unauthorized(string message) =>
        new("UNAUTHORIZED_ACCESS", message, 401, ServiceCategory.Authentication, null);

    public static ServiceError PermissionDenied(string message) =>
        new("PERMISSION_DENIED", message, 403, ServiceCategory.General, null);

    public static ServiceError Forbidden(string message) =>
        new("FORBIDDEN", message, 403, ServiceCategory.General, null);

    public static ServiceError BadRequest(string message) =>
        new("BAD_REQUEST", message, 400, ServiceCategory.Validation, null);

    public static ServiceError Inactive(string entity, string detail) =>
        new($"{entity.ToUpperInvariant()}_INACTIVE", $"{entity} with {detail} is inactive", 403, ServiceCategory.General, null);

    public static ServiceError RequiredField(string fieldName) =>
        new("REQUIRED_FIELD_MISSING", $"{fieldName} is required", 400, ServiceCategory.Validation, null);

    public static ServiceError InvalidFormat(string fieldName) =>
        new("INVALID_FORMAT", $"{fieldName} format is invalid", 400, ServiceCategory.Validation, null);

    public static ServiceError Internal(string message) =>
        new("INTERNAL_backend_ERROR", message, 500, ServiceCategory.General, null);
    // Authentication-specific errors with descriptive codes
    public static ServiceError EmailAlreadyExists() =>
        new("EMAIL_ALREADY_EXISTS", "An account with this email already exists", 409, ServiceCategory.Authentication, null);

    public static ServiceError InvalidCredentials() =>
        new("INVALID_CREDENTIALS", "Invalid email or password", 401, ServiceCategory.Authentication, null);

    public static ServiceError EmailNotVerified() =>
        new("EMAIL_NOT_VERIFIED", "Email address has not been verified", 403, ServiceCategory.Authentication, null);

    public static ServiceError AccountLocked() =>
        new("ACCOUNT_LOCKED", "Account has been locked due to multiple failed login attempts", 403, ServiceCategory.Authentication, null);
    // Token-specific errors with descriptive codes
    public static ServiceError TokenGenerationFailed() =>
        new("TOKEN_GENERATION_FAILED", "Failed to generate authentication token", 500, ServiceCategory.Token, null);

    public static ServiceError TokenExpired() =>
        new("TOKEN_EXPIRED", "Token has expired", 401, ServiceCategory.Token, null);

    public static ServiceError InvalidTokenSignature() =>
        new("INVALID_TOKEN_SIGNATURE", "Token signature is invalid", 401, ServiceCategory.Token, null);

    public static ServiceError InvalidTokenFormat() =>
        new("INVALID_TOKEN_FORMAT", "Token format is invalid", 401, ServiceCategory.Token, null);

    public static ServiceError MissingTokenClaims() =>
        new("MISSING_TOKEN_CLAIMS", "Required claims are missing from token", 401, ServiceCategory.Token, null);

    public static ServiceError InvalidToken(string message) =>
        new("INVALID_TOKEN", message, 401, ServiceCategory.Token, null);

    public static ServiceError ExpiredToken() =>
        new("TOKEN_EXPIRED", "Token has expired", 401, ServiceCategory.Token, null);
    // Password-specific errors with descriptive codes
    public static ServiceError WeakPassword() =>
        new("PASSWORD_TOO_WEAK", "Password does not meet security requirements", 400, ServiceCategory.Password, null);

    public static ServiceError PasswordHashFailed() =>
        new("PASSWORD_HASH_FAILED", "Failed to hash password", 500, ServiceCategory.Password, null);


    public static ServiceError ValueTooLong(string fieldName, int maxLength) =>
        new("VALUE_TOO_LONG", $"{fieldName} cannot exceed {maxLength} characters", 400, ServiceCategory.Validation, null);

    public static ServiceError ValueTooShort(string fieldName, int minLength) =>
        new("VALUE_TOO_SHORT", $"{fieldName} must be at least {minLength} characters", 400, ServiceCategory.Validation, null);

    // Registration-specific validation errors
    public static ServiceError InvalidRegistrationData(string message) =>
        new("INVALID_REGISTRATION_DATA", message, 400, ServiceCategory.Validation, null);

    public static ServiceError EmailFormatInvalid() =>
        new("EMAIL_FORMAT_INVALID", "Email format is invalid", 400, ServiceCategory.Validation, null);

    public static ServiceError PasswordComplexityFailed() =>
        new("PASSWORD_COMPLEXITY_FAILED", "Password must contain uppercase, lowercase, digit, and special character", 400, ServiceCategory.Validation, null);

    public static ServiceError TermsNotAccepted() =>
        new("TERMS_NOT_ACCEPTED", "You must accept the terms and conditions", 400, ServiceCategory.Validation, null);
    public static ServiceError InvalidNameFormat(string fieldName) =>
        new("INVALID_NAME_FORMAT", $"{fieldName} contains invalid characters", 400, ServiceCategory.Validation);

    public static ServiceError DateOfBirthRequired() =>
        new("DATE_OF_BIRTH_REQUIRED", "Date of birth is required", 400, ServiceCategory.Validation, null);

    public static ServiceError InsufficientStock() =>
        new("INSUFFICIENT_STOCK", "Insufficient stock available", 409, ServiceCategory.Product, null);
    // Image-specific errors
    public static ServiceError InvalidImageFormat(string fileName) =>
        new("INVALID_IMAGE_FORMAT", $"Invalid image format: {fileName}. Only jpg, png, webp, gif allowed.", 400, ServiceCategory.Image, null);

    public static ServiceError ImageTooLarge(long sizeBytes) =>
        new("IMAGE_TOO_LARGE", $"Image too large: {sizeBytes / 1024 / 1024}MB (max 5MB)", 400, ServiceCategory.Image, null);

    public static ServiceError ImageUploadRateLimit() =>
        new("IMAGE_UPLOAD_RATE_LIMIT", "Upload rate limit exceeded (max 10 per minute)", 429, ServiceCategory.Image, null);

    public static ServiceError StorageServiceUnavailable() =>
        new("STORAGE_SERVICE_UNAVAILABLE", "Image storage service temporarily unavailable", 503, ServiceCategory.Image, null);

    public static ServiceError InvalidImageContent() =>
        new("INVALID_IMAGE_CONTENT", "File is not a valid image", 400, ServiceCategory.Image, null);

    public static ServiceError StorageQuotaExceeded() =>
        new("STORAGE_QUOTA_EXCEEDED", "Storage quota exceeded", 507, ServiceCategory.Image, null);

    public static ServiceError ImageNotFound(string imageUrl) =>
        new("IMAGE_NOT_FOUND", $"Image not found: {imageUrl}", 404, ServiceCategory.Image, null);
    public static ServiceError TooManyRequests(string message) =>
        new("TOO_MANY_REQUESTS", message, 429, ServiceCategory.General, null);

    public static ServiceError InvalidImageUrl(string url) =>
        new("INVALID_IMAGE_URL", $"The provided image URL is invalid: {url}", 400, ServiceCategory.Image, null);

    public static ServiceError BatchValidationFailed(string message) =>
        new("BATCH_VALIDATION_FAILED", message, 400, ServiceCategory.Image, null);
    // NEW: FluentValidation integration factory methods
    public static ServiceError FromFluentValidation(ValidationResult validationResult)
    {
        if (validationResult.IsValid)
        {
            throw new ArgumentException("Cannot create ServiceError from valid ValidationResult", nameof(validationResult));
        }

        var fieldErrors = validationResult.Errors
            .GroupBy(e => e.PropertyName.ToCamelCase())
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        // Use first error message as primary message, or generic message for multiple fields
        var primaryMessage = validationResult.Errors.Count == 1
            ? validationResult.Errors[0].ErrorMessage
            : $"Validation failed for {fieldErrors.Count} fields";

        return new ServiceError(
            code: "VALIDATION_FAILED",
            message: primaryMessage,
            statusCode: 400,
            category: ServiceCategory.Validation,
            errors: fieldErrors
        );
    }

    // NEW: Single field validation error
    public static ServiceError FieldValidationError(string fieldName, string errorMessage) =>
        new ServiceError(
            code: "FIELD_VALIDATION_ERROR",
            message: errorMessage,
            statusCode: 400,
            category: ServiceCategory.Validation,
            errors: new Dictionary<string, string[]>
            {
                [fieldName.ToCamelCase()] = [errorMessage]
            }
        );

    // NEW: Multiple field validation errors
    public static ServiceError MultipleFieldErrors(Dictionary<string, string[]> fieldErrors)
    {
        var totalErrors = fieldErrors.Values.Sum(e => e.Length);
        var primaryMessage = fieldErrors.Count == 1
            ? fieldErrors.First().Value.First()
            : $"Validation failed for {fieldErrors.Count} fields";

        return new ServiceError(
            code: "VALIDATION_FAILED",
            message: primaryMessage,
            statusCode: 400,
            category: ServiceCategory.Validation,
            errors: fieldErrors.ToDictionary(
                kvp => kvp.Key.ToCamelCase(),
                kvp => kvp.Value
            )
        );
    }

    // NEW: Internal factory for creating ServiceError with all properties (used by extensions)
    internal static ServiceError Create(string code, string message, int statusCode, ServiceCategory category, Dictionary<string, string[]>? errors) =>
        new(code, message, statusCode, category, errors);
}

// NEW: String extension for field name conversion
public static class StringExtensions
{
    public static string ToCamelCase(this string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // Handle common patterns from FluentValidation property names
        return char.ToLowerInvariant(input[0]) + input[1..];
    }
}

// NEW: Extension methods for backward compatibility and easy migration
public static class ServiceErrorExtensions
{
    /// <summary>
    /// Adds a field error to an existing ServiceError (creates new instance)
    /// </summary>
    public static ServiceError WithFieldError(this ServiceError error, string fieldName, string message)
    {
        var errors = error.Errors ?? new Dictionary<string, string[]>();
        errors[fieldName.ToCamelCase()] = [message];

        return ServiceError.Create(
            error.ErrorCode,
            error.Message,
            error.StatusCode,
            error.Category,
            errors
        );
    }

    /// <summary>
    /// Adds multiple field errors to an existing ServiceError (creates new instance)
    /// </summary>
    public static ServiceError WithFieldErrors(this ServiceError error, Dictionary<string, string[]> fieldErrors)
    {
        var allErrors = error.Errors ?? new Dictionary<string, string[]>();

        foreach (var kvp in fieldErrors)
        {
            allErrors[kvp.Key.ToCamelCase()] = kvp.Value;
        }

        return ServiceError.Create(
            error.ErrorCode,
            error.Message,
            error.StatusCode,
            error.Category,
            allErrors
        );
    }

    /// <summary>
    /// Enhanced factory method for authentication errors with field validation
    /// Useful for login/register forms that need both field and general errors
    /// </summary>
    public static ServiceError EmailAlreadyExistsWithField() =>
        ServiceError.EmailAlreadyExists()
            .WithFieldError("email", "This email is already registered");

    /// <summary>
    /// Enhanced factory method for invalid credentials with field hints
    /// </summary>
    public static ServiceError InvalidCredentialsWithFields() =>
        ServiceError.InvalidCredentials()
            .WithFieldError("email", "Invalid email or password")
            .WithFieldError("password", "Invalid email or password");
}