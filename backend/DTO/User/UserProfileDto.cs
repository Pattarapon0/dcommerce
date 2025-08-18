using backend.Common.Enums;

namespace backend.DTO.User;

public record UserProfileDto
{
    // Core Identity (Essential)
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;

    // Account Status (Essential)
    public bool IsActive { get; init; }
    public bool IsVerified { get; init; }

    // Profile Information (Essential)
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public string? AvatarUrl { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public Currency? PreferredCurrency { get; init; }

    public bool IsSellerApproved { get; init; }

    public string? BusinessName { get; init; }

    public string? BusinessDescription { get; init; }

    public string? BusinessAvatarUrl { get; init; }
}