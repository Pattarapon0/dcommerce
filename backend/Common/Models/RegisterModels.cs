using backend.DTO.User;

namespace backend.Common.Models;

// Manual registration
public record RegisterRequest
{
    // Essential authentication
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    
    // Basic profile (required for e-commerce)
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    
    // Contact info (optional)
    public string? PhoneNumber { get; init; }
    public DateTime? DateOfBirth { get; init; }
    
    // Legal/Marketing (required) - FIXED FIELD NAME
    public bool AcceptedTerms { get; init; } = false;
    public bool NewsletterSubscription { get; init; } = false;
    
    // Optional social features
    public string? Username { get; init; }
    
    // Preferences (optional)
    public string? PreferredLanguage { get; init; }
    public string? PreferredCurrency { get; init; }
}

// OAuth registration (minimal required info)
public record OAuthRegisterRequest
{
    public string Email { get; init; } = string.Empty;
    public string Provider { get; init; } = string.Empty;
    public string ProviderKey { get; init; } = string.Empty;
    public string? ProviderDisplayName { get; init; }
    
    // Profile info from OAuth provider
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Username { get; init; }
    
    // OAuth tokens
    public string? AccessToken { get; init; }
    public string? RefreshTokenOAuth { get; init; }
    public DateTime? TokenExpiresAt { get; init; }
    public string? Scope { get; init; }
    
    // Legal (required) - FIXED FIELD NAME
    public bool AcceptedTerms { get; init; } = false;
    public bool NewsletterSubscription { get; init; } = false;
}

// Profile completion (for OAuth users missing e-commerce info)
public record CompleteProfileRequest
{
    public string? Country { get; init; }
    public string? PhoneNumber { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? PreferredLanguage { get; init; }
    public string? PreferredCurrency { get; init; }
}

public record RegisterResponse
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string? Country { get; init; }
    public bool ProfileComplete { get; init; }
    public bool IsOAuthUser { get; init; }
    public string Message { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record VerifyEmailRequest
{
    public string Token { get; init; } = string.Empty;
}

public record VerifyEmailResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public TokenResult? AccessToken { get; init; }
    public string? RefreshToken { get; init; }
    public UserProfileDto? Profile { get; init; }
}

public record ResendVerificationRequest
{
    public string Email { get; init; } = string.Empty;
}

public record ResendVerificationResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
}