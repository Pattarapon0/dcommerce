using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data.Common;
using backend.Data.Sellers.Entities;
using backend.Data.Orders.Entities;
using backend.Data.Cart.Entities;

namespace backend.Data.User.Entities;

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
    public string? PreferredLanguage { get; set; } = "th"; // Default to Thai

    [MaxLength(10)]
    public string? PreferredCurrency { get; set; } = "THB"; // Default to Thai Baht

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
    public string Role { get; set; } = "Buyer"; // Default role

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

    public DateTime? BecameSellerAt { get; set; }

    // Computed properties
    [NotMapped]
    public string FullName => Profile?.FullName ?? Username ?? Email.Split('@')[0];

    [NotMapped]
    public bool HasPassword => !string.IsNullOrEmpty(PasswordHash);

    [NotMapped]
    public bool IsOAuthUser => Logins.Any(l => !string.IsNullOrEmpty(l.Provider) && l.Provider != "local");

    [NotMapped]
    public bool IsActiveSeller => BecameSellerAt.HasValue && IsActive;
    // Navigation properties
    public virtual UserProfile? Profile { get; set; }
    public virtual ICollection<UserLogin> Logins { get; set; } = [];
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    public virtual UserAddress? Address { get; set; }

    public virtual SellerProfile? SellerProfile { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = [];
    public virtual ICollection<Products.Entities.Product> Products { get; set; } = [];
    public virtual ICollection<CartItem> CartItems { get; set; } = [];
}

 