namespace backend.DTO.User;

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