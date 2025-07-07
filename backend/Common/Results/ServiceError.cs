using LanguageExt.Common;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using static LanguageExt.Prelude;

namespace backend.Common.Results;

public record ServiceError : Error
{
    private readonly string _code;
    private readonly ServiceCategory _category;

    private ServiceError(string code, string message, int statusCode, ServiceCategory category = ServiceCategory.General)
    {
        _code = code;
        Message = message;
        StatusCode = statusCode;
        _category = category;
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
    }

    // Core properties for API responses (serialized by custom converter)
    public string ErrorCode => _code;
    public override string Message { get; }
    public int StatusCode { get; }
    public ServiceCategory Category => _category;

    // Required overrides for LanguageExt.Error
    public override int Code => StatusCode;
    public override bool IsExpected => true;
    public override bool IsExceptional => false;
    public override Exception ToException() => new ServiceErrorException(this);
    public override ErrorException ToErrorException() => new ServiceErrorException(this);
    public override bool Is<E>() => this is E;

    // Utility properties for internal use
    public bool IsClientError => StatusCode >= 400 && StatusCode < 500;
    public bool IsbackendError => StatusCode >= 500;
    public bool IsAuthenticationError => _category == ServiceCategory.Authentication || _category == ServiceCategory.Token;

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

        // Database exceptions
        DbUpdateException dbEx when IsUniqueConstraintViolation(dbEx) =>
            Conflict("A record with this key already exists"),

        DbUpdateException dbEx when IsForeignKeyViolation(dbEx) =>
            new("INVALID_REFERENCE", "Invalid reference to related entity", 400, ServiceCategory.Validation),

        DbUpdateException dbEx when IsCheckConstraintViolation(dbEx) =>
            new("DATA_VALIDATION_FAILED", "Data validation failed", 400, ServiceCategory.Validation),

        DbUpdateException dbEx when IsNullConstraintViolation(dbEx) =>
            new("REQUIRED_DATA_MISSING", "Required data is missing", 400, ServiceCategory.Validation),

        InvalidOperationException opEx =>
            new("INVALID_OPERATION", opEx.Message, 400, ServiceCategory.Validation),

        TimeoutException _ =>
            Internal("Database operation timed out"),

        OperationCanceledException _ =>
            Internal("Operation was cancelled"),

        SqliteException sqlEx =>
            Internal($"Database error: {sqlEx.Message}"),

        _ => Internal($"An unexpected error occurred: {ex.Message}")
    };

    private static bool IsUniqueConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("UNIQUE constraint") ?? false;

    private static bool IsForeignKeyViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("FOREIGN KEY constraint") ?? false;

    private static bool IsCheckConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("CHECK constraint") ?? false;

    private static bool IsNullConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("NOT NULL constraint") ?? false;

    // Generic error methods with improved error codes
    public static ServiceError NotFound(string entity, string detail) =>
        new($"{entity.ToUpperInvariant()}_NOT_FOUND", $"{entity} with {detail} not found", 404, ServiceCategory.Database);

    public static ServiceError Validation(string message) =>
        new("REQUIRED_FIELDS_MISSING", message, 400, ServiceCategory.Validation);

    public static ServiceError Unauthorized(string message) =>
        new("UNAUTHORIZED_ACCESS", message, 401, ServiceCategory.Authentication);

    public static ServiceError Conflict(string message) =>
        new("RESOURCE_CONFLICT", message, 409, ServiceCategory.Database);

    public static ServiceError Internal(string message) =>
        new("INTERNAL_backend_ERROR", message, 500);

    // Authentication-specific errors with descriptive codes
    public static ServiceError EmailAlreadyExists() =>
        new("EMAIL_ALREADY_EXISTS", "An account with this email already exists", 409, ServiceCategory.Authentication);

    public static ServiceError InvalidCredentials() =>
        new("INVALID_CREDENTIALS", "Invalid email or password", 401, ServiceCategory.Authentication);

    public static ServiceError EmailNotVerified() =>
        new("EMAIL_NOT_VERIFIED", "Email address has not been verified", 403, ServiceCategory.Authentication);

    public static ServiceError AccountLocked() =>
        new("ACCOUNT_LOCKED", "Account has been locked due to multiple failed login attempts", 403, ServiceCategory.Authentication);

    // Token-specific errors with descriptive codes
    public static ServiceError TokenGenerationFailed() =>
        new("TOKEN_GENERATION_FAILED", "Failed to generate authentication token", 500, ServiceCategory.Token);

    public static ServiceError TokenExpired() =>
        new("TOKEN_EXPIRED", "Token has expired", 401, ServiceCategory.Token);

    public static ServiceError InvalidTokenSignature() =>
        new("INVALID_TOKEN_SIGNATURE", "Token signature is invalid", 401, ServiceCategory.Token);

    public static ServiceError InvalidTokenFormat() =>
        new("INVALID_TOKEN_FORMAT", "Token format is invalid", 401, ServiceCategory.Token);

    public static ServiceError MissingTokenClaims() =>
        new("MISSING_TOKEN_CLAIMS", "Required claims are missing from token", 401, ServiceCategory.Token);

    public static ServiceError InvalidToken(string message) =>
        new("INVALID_TOKEN", message, 401, ServiceCategory.Token);

    public static ServiceError ExpiredToken() =>
        new("TOKEN_EXPIRED", "Token has expired", 401, ServiceCategory.Token);

    // Password-specific errors with descriptive codes
    public static ServiceError WeakPassword() =>
        new("PASSWORD_TOO_WEAK", "Password does not meet security requirements", 400, ServiceCategory.Password);

    public static ServiceError PasswordHashFailed() =>
        new("PASSWORD_HASH_FAILED", "Failed to hash password", 500, ServiceCategory.Password);

    // Validation-specific errors with field-specific codes
    public static ServiceError RequiredField(string fieldName) =>
        new("REQUIRED_FIELD_MISSING", $"{fieldName} is required", 400, ServiceCategory.Validation);

    public static ServiceError InvalidFormat(string fieldName) =>
        new("INVALID_FORMAT", $"{fieldName} format is invalid", 400, ServiceCategory.Validation);

    public static ServiceError ValueTooLong(string fieldName, int maxLength) =>
        new("VALUE_TOO_LONG", $"{fieldName} cannot exceed {maxLength} characters", 400, ServiceCategory.Validation);

    public static ServiceError ValueTooShort(string fieldName, int minLength) =>
        new("VALUE_TOO_SHORT", $"{fieldName} must be at least {minLength} characters", 400, ServiceCategory.Validation);

    // Registration-specific validation errors
    public static ServiceError InvalidRegistrationData(string message) =>
        new("INVALID_REGISTRATION_DATA", message, 400, ServiceCategory.Validation);

    public static ServiceError EmailFormatInvalid() =>
        new("EMAIL_FORMAT_INVALID", "Email format is invalid", 400, ServiceCategory.Validation);

    public static ServiceError PasswordComplexityFailed() =>
        new("PASSWORD_COMPLEXITY_FAILED", "Password must contain uppercase, lowercase, digit, and special character", 400, ServiceCategory.Validation);

    public static ServiceError TermsNotAccepted() =>
        new("TERMS_NOT_ACCEPTED", "You must accept the terms and conditions", 400, ServiceCategory.Validation);

    public static ServiceError InvalidNameFormat(string fieldName) =>
        new("INVALID_NAME_FORMAT", $"{fieldName} contains invalid characters", 400, ServiceCategory.Validation);

    public static ServiceError DateOfBirthRequired() =>
        new("DATE_OF_BIRTH_REQUIRED", "Date of birth is required", 400, ServiceCategory.Validation);

    public static ServiceError InsufficientStock() =>
        new("INSUFFICIENT_STOCK", "Insufficient stock available", 409, ServiceCategory.Product);
}
