using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data.Common;

namespace backend.Data.User.Entities;

public class UserLogin : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Provider { get; set; }

    [Required]
    [MaxLength(255)]
    public required string ProviderKey { get; set; }

    [MaxLength(255)]
    public string? ProviderDisplayName { get; set; }

    public DateTime? LastUsedAt { get; set; }

    // OAuth Token Management (Store encrypted in production)
    public string? AccessToken { get; set; }           // OAuth access token (encrypt in production)
    public string? RefreshTokenOAuth { get; set; }     // OAuth refresh token (encrypt in production)
    public DateTime? TokenExpiresAt { get; set; }      // When the OAuth access token expires
    public string? Scope { get; set; }                 // OAuth scopes granted (space-separated)
    public string? TokenType { get; set; } = "Bearer"; // Usually "Bearer"

    // Profile Synchronization
    public DateTime? LastProfileSync { get; set; }     // When we last synced profile from provider
    public bool AutoSyncProfile { get; set; } = false; // Whether to auto-sync profile data

    // Navigation property
    [ForeignKey("UserId")]
    public virtual required User User { get; set; }

    [NotMapped]
    public bool IsExpired => LastUsedAt.HasValue && DateTime.UtcNow.Subtract(LastUsedAt.Value).TotalDays > 180;

    [NotMapped]
    public bool IsTokenExpired => TokenExpiresAt.HasValue && DateTime.UtcNow >= TokenExpiresAt.Value;

    [NotMapped]
    public bool HasValidToken => !string.IsNullOrEmpty(AccessToken) && !IsTokenExpired;
}
