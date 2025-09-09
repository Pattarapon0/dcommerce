using backend.Data.User.Entities;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.User;

public interface IUserRepository
{
    // Basic User Operations
    Task<Fin<Entities.User>> GetByIdAsync(Guid id);
    Task<Fin<Entities.User>> GetByEmailAsync(string email);
    Task<Fin<Entities.User>> GetByUsernameAsync(string username);
    Task<Fin<Entities.User>> CreateAsync(Entities.User user);
    Task<Fin<Unit>> UpdateAsync(Entities.User user);

    // Essential User Operations
    Task<Fin<Unit>> DeactivateUserAsync(Guid id);

    // Email & Verification (Auth Integration)
    Task<Fin<bool>> EmailExistsAsync(string email);
    Task<Fin<bool>> UsernameExistsAsync(string username);
    Task<Fin<Entities.User>> GetByVerificationTokenAsync(string token);
    Task<Fin<Unit>> VerifyEmailAsync(Guid userId);
    Task<Fin<Unit>> UpdateVerificationTokenAsync(Guid userId, string token);

    // Password Reset (Auth Integration)
    Task<Fin<Unit>> UpdateResetTokenAsync(Guid userId, string token, DateTime expiry);
    Task<Fin<Entities.User>> GetByResetTokenAsync(string token);

    // Login Security (Auth Integration)
    Task<Fin<Unit>> UpdateFailedLoginAttemptsAsync(Guid userId, int attempts, DateTime lastAttempt);
    Task<Fin<Unit>> UpdateLastLoginAsync(Guid userId);

    // Profile Management
    Task<Fin<UserProfile>> GetUserProfileAsync(Guid userId);
    Task<Fin<Unit>> UpdateUserProfileAsync(UserProfile profile);
    Task<Fin<UserProfile>> CreateUserProfileAsync(UserProfile profile);

    // Refresh Tokens (Auth Integration)
    Task<Fin<RefreshToken>> AddRefreshTokenAsync(RefreshToken token);
    Task<Fin<Unit>> CompleteSuccessfulLoginAsync(Guid userId, RefreshToken refreshToken);
    Task<Fin<RefreshToken>> GetRefreshTokenAsync(string token);
    Task<Fin<Unit>> RevokeRefreshTokenAsync(string token);
    Task<Fin<Unit>> RevokeAllUserRefreshTokensAsync(Guid userId);
    Task<Fin<Unit>> DeleteExpiredRefreshTokensAsync();

    // User Address (E-commerce Essential)
    Task<Fin<UserAddress>> CreateUserAddressAsync(UserAddress address);
    Task<Fin<UserAddress>> GetUserAddressAsyncByUserId(Guid userId);
    Task<Fin<Unit>> UpdateUserAddressAsync(UserAddress address);
    Task<Fin<Unit>> DeleteUserAddressAsyncByUserId(Guid userId);

    // OAuth Operations
    Task<Fin<UserLogin>> CreateUserLoginAsync(UserLogin userLogin);
    Task<Fin<UserLogin>> GetUserLoginAsync(string provider, string providerKey);
    Task<Fin<Entities.User>> GetUserByProviderAsync(string provider, string providerKey);
    Task<Fin<Unit>> UpdateUserLoginAsync(UserLogin userLogin);
}