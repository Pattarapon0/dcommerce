using System.ComponentModel.DataAnnotations;
using server.Data.Common;

namespace server.Data.User.Entities;

/// <summary>
/// Optional: Tracks OAuth authorization states for enhanced security (CSRF protection)
/// </summary>
public class OAuthState : BaseEntity
{
 
    [Required]
    [MaxLength(255)]
    public required string State { get; set; }  // CSRF protection

    [MaxLength(255)]
    public string? Nonce { get; set; }  // OpenID Connect nonce

    [Required]
    [MaxLength(50)]
    public required string Provider { get; set; }

    [MaxLength(500)]
    public string? RedirectUri { get; set; }

    [MaxLength(128)]
    public string? CodeChallenge { get; set; }  // PKCE support

    [MaxLength(10)]
    public string? CodeChallengeMethod { get; set; } = "S256";  // PKCE method

    [Required]
    public DateTime ExpiresAt { get; set; }

    // For tracking which user initiated (if logged in)
    public Guid? UserId { get; set; }
    public virtual User? User { get; set; }
}
