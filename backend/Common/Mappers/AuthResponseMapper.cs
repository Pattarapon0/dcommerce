using server.Common.Models;
using server.Data.User.Entities;

namespace server.Common.Mappers;

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
            IsOAuthUser = createdUser.IsOAuthUser,
            Message = "Registration successful. Please check your email for verification.",
            CreatedAt = createdUser.CreatedAt
        };
    }

    public static VerifyEmailResponse CreateVerifyEmailResponse(User user)
    {
        return new VerifyEmailResponse
        {
            Success = true,
            Message = "Email verified successfully",
            Profile = UserMapper.ToUserProfileSummary(user, isVerified: true)
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
