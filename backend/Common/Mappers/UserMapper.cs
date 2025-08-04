using backend.Common.Models;
using backend.Data.User.Entities;

namespace backend.Common.Mappers;

public static class UserMapper
{
    public static (User user, UserProfile profile) CreateUserWithProfile(RegisterRequest request, string hashedPassword)
    {
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            // Authentication fields
            Email = request.Email,
            PasswordHash = hashedPassword,
            IsVerified = false,
            EmailVerificationToken = Guid.NewGuid().ToString("N"),

            // Legal/Marketing - FIXED field mapping
            AcceptedTerms = request.AcceptedTerms,
            TermsAcceptedAt = request.AcceptedTerms ? now : null,
            NewsletterSubscription = request.NewsletterSubscription,

            // User preferences (language always defaults to English)
            PreferredLanguage = "en",
            PreferredCurrency = request.PreferredCurrency ?? "USD",
            Username = request.Username,

            // Account status
            
            IsActive = true,

            // Security defaults
            FailedLoginAttempts = 0,

            // FIXED: Set all required timestamp fields
            CreatedAt = now,
            UpdatedAt = now
        };

        var profile = new UserProfile
        {
            // Basic profile information from registration
            FirstName = request.FirstName,
            LastName = request.LastName,
            Country = request.Country,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,

            // FIXED: Set all required timestamp fields
            CreatedAt = now,
            UpdatedAt = now,

            // Navigation property - EF will set UserId automatically
            User = user
        };

        // Set the navigation property on user as well
        user.Profile = profile;

        return (user, profile);
    }

    // Keep the old method for backward compatibility, but mark as obsolete
    [Obsolete("Use CreateUserWithProfile instead to properly create both User and UserProfile entities")]
    public static User CreateUser(RegisterRequest request, string hashedPassword)
    {
        var now = DateTime.UtcNow;

        return new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = hashedPassword,
            AcceptedTerms = request.AcceptedTerms,
            TermsAcceptedAt = request.AcceptedTerms ? now : null,
            NewsletterSubscription = request.NewsletterSubscription,
            Username = request.Username,
            PreferredLanguage = "en", // Always default to English
            PreferredCurrency = request.PreferredCurrency,
            IsVerified = false,
            Role = "User",
            CreatedAt = now,
            UpdatedAt = now,
            EmailVerificationToken = Guid.NewGuid().ToString("N"),
            FailedLoginAttempts = 0
        };
    }

    public static backend.DTO.User.UserProfileDto ToUserProfileDto(User user, bool isVerified = false)
    {
        return new backend.DTO.User.UserProfileDto
        {
            // Core Identity
            UserId = user.Id,
            Email = user.Email,
            Username = user.Username,
            Role = user.Role,
            
            // Account Status
            IsActive = user.IsActive,
            IsVerified = isVerified || user.IsVerified,
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin,
            
            // Profile Information
            FirstName = user.Profile?.FirstName,
            LastName = user.Profile?.LastName,
            FullName = user.FullName,
            PhoneNumber = user.Profile?.PhoneNumber,
            AvatarUrl = user.Profile?.AvatarUrl,
            
            // Profile Completion & OAuth
            ProfileComplete = !string.IsNullOrEmpty(user.Profile?.FirstName) && 
                            !string.IsNullOrEmpty(user.Profile?.LastName),
            IsOAuthUser = user.IsOAuthUser
        };
    }
}