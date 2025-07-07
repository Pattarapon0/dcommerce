namespace backend.DTO.User;
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
