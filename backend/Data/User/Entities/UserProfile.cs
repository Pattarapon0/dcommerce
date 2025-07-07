using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data.Common;

namespace backend.Data.User.Entities;

public class UserProfile : BaseEntity
{
    [Key]
    public Guid UserId { get; set; }

    // Basic profile information (from registration)
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(20)]
    [Phone]
    public string? PhoneNumber { get; set; }

    public DateTime? DateOfBirth { get; set; }

    // Address information
    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(20)]
    public string? PostalCode { get; set; }

    // Extended profile information
    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    [MaxLength(100)]
    [Url]
    public string? Website { get; set; }

    [MaxLength(50)]
    public string? Timezone { get; set; }

    // Store as JSON string for social media links
    public string? SocialLinks { get; set; }

    // Navigation property
    public virtual required User User { get; set; }

    [NotMapped]
    public string? FullName => string.IsNullOrWhiteSpace($"{FirstName} {LastName}".Trim()) 
        ? null 
        : $"{FirstName} {LastName}".Trim();
}
