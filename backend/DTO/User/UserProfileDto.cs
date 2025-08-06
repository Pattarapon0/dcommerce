using backend.Common.Enums;

namespace backend.DTO.User;

public record UserProfileDto
{
    // Core Identity
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string? Username { get; init; }
    public string Role { get; init; } = string.Empty;
    
    // Account Status  
    public bool IsActive { get; init; }
    public bool IsVerified { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLogin { get; init; }
    
    // Profile Information
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public string? AvatarUrl { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public Currency? PreferredCurrency { get; init; }
    
    // Profile Completion & OAuth
    public bool ProfileComplete { get; init; }
    public bool IsOAuthUser { get; init; }
}