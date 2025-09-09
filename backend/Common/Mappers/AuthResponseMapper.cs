using backend.Common.Models;
using backend.Data.User.Entities;

namespace backend.Common.Mappers;

public static class AuthResponseMapper
{
    public static RegisterResponse CreateRegisterResponse(User createdUser)
    {
        return new RegisterResponse
        {
            UserId = createdUser.Id,
            Email = createdUser.Email,
            // FIXED: Use computed FullName property that checks Profile
            FullName = createdUser.FullName,
            // FIXED: Get country from Profile instead of User
            Country = createdUser.Profile?.Country,
            ProfileComplete = IsProfileComplete(createdUser),
            IsOAuthUser = createdUser.IsOAuthUser,
            Message = "Registration successful. Please check your email for verification.",
            CreatedAt = createdUser.CreatedAt
        };
    }

    /// <summary>
    /// Check if user profile is complete for e-commerce requirements
    /// Profile is complete when user has: phone number, date of birth, and valid country
    /// </summary>
    private static bool IsProfileComplete(User user)
    {
        if (user.Profile == null) return false;
        
        return !string.IsNullOrWhiteSpace(user.Profile.PhoneNumber) &&
               user.Profile.DateOfBirth.HasValue &&
               !string.IsNullOrWhiteSpace(user.Profile.Country) &&
               user.Profile.Country != "Unknown";
    }

    public static VerifyEmailResponse CreateVerifyEmailResponse(User user)
    {
        return new VerifyEmailResponse
        {
            Success = true,
            Message = "Email verified successfully",
            Profile = UserMapper.ToUserProfileDto(user, isVerified: true)
        };
    }

    public static ResendVerificationResponse CreateResendVerificationResponse(bool success, string message)
    {
        return new ResendVerificationResponse
        {
            Success = success,
            Message = message
        };
    }
}
