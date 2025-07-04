using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Data.Common;

namespace server.Data.User.Entities;

public class User : BaseUserEntity
{
    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public required string Email { get; set; }

    // Password is optional (OAuth users might not have one)
    public string? PasswordHash { get; set; }

    // Preferences (user-specific, not profile)
    [MaxLength(10)]
    public string? PreferredLanguage { get; set; } = "en";

    [MaxLength(10)]
    public string? PreferredCurrency { get; set; } = "USD";

    // Optional username (for social features)
    [MaxLength(50)]
    public string? Username { get; set; }

    // Email verification (different for OAuth vs manual)
    public string? EmailVerificationToken { get; set; }
    public bool IsVerified { get; set; }

    // Password reset (only for password-based accounts)
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }

    // Role and permissions
    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "User";

    // Security (only for password-based accounts)
    public int FailedLoginAttempts { get; set; }
    public DateTime? LastLoginAttempt { get; set; }
    public DateTime? LastLogin { get; set; }

    // Legal/Marketing preferences
    public bool AcceptedTerms { get; set; }
    public DateTime? TermsAcceptedAt { get; set; }
    public bool NewsletterSubscription { get; set; }

    // Account status

    public string? DeactivationReason { get; set; }

 
    // Computed properties
    [NotMapped]
    public string FullName => Profile?.FullName ?? Username ?? Email.Split('@')[0];

    [NotMapped]
    public bool HasPassword => !string.IsNullOrEmpty(PasswordHash);

    [NotMapped]
    public bool IsOAuthUser => Logins.Any(l => !string.IsNullOrEmpty(l.Provider) && l.Provider != "local");

    // Navigation properties
    public virtual UserProfile? Profile { get; set; }
    public virtual ICollection<UserLogin> Logins { get; set; } = new List<UserLogin>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
