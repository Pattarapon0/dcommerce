using Microsoft.EntityFrameworkCore;
using backend.Common.Results;
using backend.Data.User.Entities;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.User;

public class UserRepository(ECommerceDbContext context) : IUserRepository
{
    private readonly ECommerceDbContext _context = context;

    public async Task<Fin<Entities.User>> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .Include(u => u.SellerProfile)
                .FirstOrDefaultAsync(u => u.Id == id);

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", "UserId: " + id.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Entities.User>> GetByEmailAsync(string email)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Email.Equals(email));

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", "Email: " + email));
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Entities.User>> GetByUsernameAsync(string username)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Username != null && u.Username.Equals(username));

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", "Username: " + username));
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Entities.User>> CreateAsync(Entities.User user)
    {
        try
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return FinSucc(user);
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateAsync(Entities.User user)
    {
        try
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeactivateUserAsync(Guid id)    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", "UserId: " + id.ToString()));

            user.IsActive = false;
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<IEnumerable<Entities.User>>> GetDeactivatedUsersAsync()    {
        try
        {
            var users = await _context.Users
                .Where(u => !u.IsActive)
                .Include(u => u.Profile)
                .ToListAsync();

            return FinSucc(users.AsEnumerable());
        }
        catch (Exception ex)
        {
            return FinFail<IEnumerable<Entities.User>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> PurgeDeactivatedUsersAsync(DateTime before)
    {
        try
        {
            var users = await _context.Users
                .Where(u => !u.IsActive && u.DeletedAt < before)
                .ToListAsync();

            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> EmailExistsAsync(string email)
    {
        try
        {
            var exists = await _context.Users
                .Where(u => u.IsActive)
                .AnyAsync(u => u.Email.Equals(email.ToLower()));
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> UsernameExistsAsync(string username)
    {
        try
        {
            var exists = await _context.Users
                .Where(u => u.IsActive)
                .AnyAsync(u => u.Username != null && u.Username.Equals(username.ToLower()));
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Entities.User>> GetByVerificationTokenAsync(string token)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("VerificationToken", "Token: " + token));
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> VerifyEmailAsync(Guid userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", "UserId: " + userId.ToString()));

            user.IsVerified = true;
            user.EmailVerificationToken = null;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateVerificationTokenAsync(Guid userId, string token)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", "UserId: " + userId.ToString()));

            user.EmailVerificationToken = token;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateResetTokenAsync(Guid userId, string token, DateTime expiry)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", userId.ToString()));

            user.ResetToken = token;
            user.ResetTokenExpiry = expiry;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Entities.User>> GetByResetTokenAsync(string token)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.ResetToken == token && u.ResetTokenExpiry > DateTime.UtcNow);

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("ResetToken", "Token: " + token));
        }
        catch (Exception ex)
        {
            return FinFail<Entities.User>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateFailedLoginAttemptsAsync(Guid userId, int attempts, DateTime lastAttempt)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", "UserId: " + userId.ToString()));

            user.FailedLoginAttempts = attempts;
            user.LastLoginAttempt = lastAttempt;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateLastLoginAsync(Guid userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", "UserId: " + userId.ToString()));

            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<UserProfile>> GetUserProfileAsync(Guid userId)
    {
        try
        {
            var profile = await _context.UserProfiles.FindAsync(userId);
            return profile != null
                ? FinSucc(profile)
                : FinFail<UserProfile>(ServiceError.NotFound("UserProfile", "userId: " + userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<UserProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateUserProfileAsync(UserProfile profile)
    {
        try
        {
            _context.UserProfiles.Update(profile);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<RefreshToken>> AddRefreshTokenAsync(RefreshToken token)    {
        try
        {
            await _context.RefreshTokens.AddAsync(token);
            await _context.SaveChangesAsync();
            return FinSucc(token);
        }
        catch (Exception ex)
        {
            return FinFail<RefreshToken>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> CompleteSuccessfulLoginAsync(Guid userId, RefreshToken refreshToken)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Add refresh token
            await _context.RefreshTokens.AddAsync(refreshToken);
            
            // 2. Update last login and reset failed attempts in one query
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.LastLogin = DateTime.UtcNow;
                user.LastLoginAttempt = DateTime.UtcNow;
                user.FailedLoginAttempts = 0; // Reset failed attempts on successful login
            }
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }
    public async Task<Fin<RefreshToken>> GetRefreshTokenAsync(string token)
    {
        try
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

            return refreshToken != null
                ? FinSucc(refreshToken)
                : FinFail<RefreshToken>(ServiceError.NotFound("RefreshToken", "Token: " + token));
        }
        catch (Exception ex)
        {
            return FinFail<RefreshToken>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RevokeRefreshTokenAsync(string token)
    {
        try
        {
            var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);
            if (refreshToken == null)
                return FinFail<Unit>(ServiceError.NotFound("RefreshToken", "Token: " + token));

            refreshToken.IsRevoked = true;
            refreshToken.ReasonRevoked = "Manually revoked";
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RevokeAllUserRefreshTokensAsync(Guid userId)
    {
        try
        {
            var tokens = await _context.RefreshTokens
                .Where(r => r.UserId == userId && !r.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.ReasonRevoked = "All tokens revoked";
            }

            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteExpiredRefreshTokensAsync()
    {
        try
        {
            var tokens = await _context.RefreshTokens
                .Where(r => r.ExpiresAt <= DateTime.UtcNow)
                .ToListAsync();

            _context.RefreshTokens.RemoveRange(tokens);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<UserAddress>> CreateUserAddressAsync(UserAddress address)
    {
        try
        {
            await _context.UserAddresses.AddAsync(address);
            await _context.SaveChangesAsync();
            return FinSucc(address);
        }
        catch (Exception ex)
        {
            return FinFail<UserAddress>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<UserAddress>> GetUserAddressAsyncByUserId(Guid userId)
    {
        try
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.UserId == userId);

            return address != null
                ? FinSucc(address)
                : FinFail<UserAddress>(ServiceError.NotFound("UserAddress", "userId: " + userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<UserAddress>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateUserAddressAsync(UserAddress address)
    {
        try
        {
            _context.UserAddresses.Update(address);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteUserAddressAsyncByUserId(Guid userId)
    {
        try
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.UserId == userId);
            if (address == null)
                return FinFail<Unit>(ServiceError.NotFound("UserAddress", "userId: " + userId.ToString()));

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<UserProfile>> CreateUserProfileAsync(UserProfile profile)
    {
        try
        {
            await _context.UserProfiles.AddAsync(profile);
            await _context.SaveChangesAsync();
            return FinSucc(profile);
        }
        catch (Exception ex)
        {
            return FinFail<UserProfile>(ServiceError.FromException(ex));
        }
    }

   
}