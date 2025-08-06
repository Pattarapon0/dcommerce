using LanguageExt;
using static LanguageExt.Prelude;
using backend.Common.Models;

namespace backend.Common.Services.Auth;

public interface IAuthService
{
    Task<Fin<RegisterResponse>> RegisterAsync(RegisterRequest request);
    //Task<Fin<RegisterResponse>> RegisterOAuthAsync(OAuthRegisterRequest request);

    // Login flows  
    Task<Fin<LoginResponse>> LoginAsync(LoginRequest request);
    /*Task<Fin<LoginResponse>> LoginOAuthAsync(string provider, string code);*/

    // Token management
    Task<Fin<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request);
    /*Task<Fin<Unit>> RevokeTokenAsync(string refreshToken);
    Task<Fin<Unit>> RevokeAllUserTokensAsync(Guid userId);*/
    // Email verification
    Task<Fin<VerifyEmailResponse>> VerifyEmailAsync(VerifyEmailRequest request);
    //Task<Fin<Unit>> ResendVerificationEmailAsync(ResendVerificationRequest request);

    // Password operations
    /*Task<Fin<Unit>> ChangePasswordAsync(ChangePasswordRequest request);
    Task<Fin<Unit>> ResetPasswordAsync(ResetPasswordRequest request);
    Task<Fin<Unit>> RequestPasswordResetAsync(string email);*/
}
