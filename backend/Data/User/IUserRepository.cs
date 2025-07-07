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

    // Delete Operations
    Task<Fin<Unit>> DeactivateUserAsync(Guid id);
    Task<Fin<Unit>> DeleteUserAsync(Guid id);
    Task<Fin<Unit>> RestoreUserAsync(Guid id);

    // Bulk Operations
    Task<Fin<IEnumerable<Entities.User>>> GetDeactivatedUsersAsync();
    Task<Fin<Unit>> PurgeDeactivatedUsersAsync(DateTime before);    // Email & Verification
    Task<Fin<bool>> EmailExistsAsync(string email);
    Task<Fin<bool>> UsernameExistsAsync(string username);
    Task<Fin<Entities.User>> GetByVerificationTokenAsync(string token);
    Task<Fin<Unit>> VerifyEmailAsync(Guid userId);
    Task<Fin<Unit>> UpdateVerificationTokenAsync(Guid userId, string token);

    // Password Reset
    Task<Fin<Unit>> UpdateResetTokenAsync(Guid userId, string token, DateTime expiry);
    Task<Fin<Entities.User>> GetByResetTokenAsync(string token);    // Login Security
    Task<Fin<Unit>> UpdateFailedLoginAttemptsAsync(Guid userId, int attempts, DateTime lastAttempt);
    Task<Fin<Unit>> UpdateLastLoginAsync(Guid userId);    // Profile Management

    Task<Fin<UserProfile>> GetUserProfileAsync(Guid userId);
    Task<Fin<Unit>> UpdateUserProfileAsync(UserProfile profile);
    Task<Fin<Unit>> DeleteUserProfileAsync(Guid userId);

    // Refresh Tokens
    Task<Fin<RefreshToken>> AddRefreshTokenAsync(RefreshToken token);
    Task<Fin<RefreshToken>> GetRefreshTokenAsync(string token);
    Task<Fin<Unit>> RevokeRefreshTokenAsync(string token);
    Task<Fin<Unit>> RevokeAllUserRefreshTokensAsync(Guid userId);
    Task<Fin<Unit>> DeleteExpiredRefreshTokensAsync();

    //user address
    Task<Fin<UserAddress>> CreateUserAddressAsync(UserAddress address);
    Task<Fin<UserAddress>> GetUserAddressAsyncByUserId(Guid userId);
    Task<Fin<Unit>> UpdateUserAddressAsync(UserAddress address);
    Task<Fin<Unit>> DeleteUserAddressAsyncByUserId(Guid userId);

}
