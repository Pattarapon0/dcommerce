using System.ComponentModel.DataAnnotations;
using backend.Common.Enums;

namespace backend.DTO.User;

public class UpdateUserProfileRequest
{
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(20)]
    [Phone]
    public string? PhoneNumber { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    [MaxLength(100)]
    [Url]
    public string? Website { get; set; }

    [MaxLength(50)]
    public string? Timezone { get; set; }

    public string? AvatarUrl { get; set; }
    public string? SocialLinks { get; set; }

    // User-level preferences
    public Currency? PreferredCurrency { get; set; }
}