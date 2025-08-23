using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data.Common;

namespace backend.Data.User.Entities;

public class RefreshToken : BaseEntity
{

    [Required]
    [MaxLength(255)]
    public required string Token { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }

    [MaxLength(255)]
    public string? ReplacedByToken { get; set; }

    [MaxLength(500)]
    public string? ReasonRevoked { get; set; }

    [MaxLength(100)]
    public string? DeviceId { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    [Required]
    public Guid UserId { get; set; }

    // Navigation property
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
    [NotMapped]
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    [NotMapped]
    public bool IsActive => !IsRevoked && !IsExpired;
}
