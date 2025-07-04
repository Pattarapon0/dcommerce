using Microsoft.EntityFrameworkCore;
using server.Common.Results;
using server.Data.User.Entities;
using LanguageExt;
using static LanguageExt.Prelude;

namespace server.Data.User;

public class UserRepository(UserDbContext context) : IUserRepository
{
    private readonly UserDbContext _context = context;

    public async Task<Fin<Entities.User>> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id);

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", id.ToString()));
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
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", email));
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
                .FirstOrDefaultAsync(u => u.Username != null && u.Username.ToLower() == username.ToLower());

            return user != null
                ? FinSucc(user)
                : FinFail<Entities.User>(ServiceError.NotFound("User", username));
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

    public async Task<Fin<Unit>> DeleteUserAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", id.ToString()));

            // Hard delete - this will cascade to related entities
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeactivateUserAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", id.ToString()));

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

    public async Task<Fin<Unit>> RestoreUserAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return FinFail<Unit>(ServiceError.NotFound("User", id.ToString()));

            user.IsActive = true;
            user.DeletedAt = null;
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<IEnumerable<Entities.User>>> GetDeactivatedUsersAsync()
    {
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
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
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
                .AnyAsync(u => u.Username != null && u.Username.ToLower() == username.ToLower());
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
                : FinFail<Entities.User>(ServiceError.NotFound("VerificationToken", token));
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
                return FinFail<Unit>(ServiceError.NotFound("User", userId.ToString()));

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
                return FinFail<Unit>(ServiceError.NotFound("User", userId.ToString()));

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
                : FinFail<Entities.User>(ServiceError.NotFound("ResetToken", token));
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
                return FinFail<Unit>(ServiceError.NotFound("User", userId.ToString()));

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
                return FinFail<Unit>(ServiceError.NotFound("User", userId.ToString()));

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
                : FinFail<UserProfile>(ServiceError.NotFound("UserProfile", userId.ToString()));
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

    public async Task<Fin<Unit>> DeleteUserProfileAsync(Guid userId)
    {
        try
        {
            var profile = await _context.UserProfiles.FindAsync(userId);
            if (profile == null)
                return FinFail<Unit>(ServiceError.NotFound("UserProfile", userId.ToString()));

            _context.UserProfiles.Remove(profile);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<RefreshToken>> AddRefreshTokenAsync(RefreshToken token)
    {
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

    public async Task<Fin<RefreshToken>> GetRefreshTokenAsync(string token)
    {
        try
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

            return refreshToken != null
                ? FinSucc(refreshToken)
                : FinFail<RefreshToken>(ServiceError.NotFound("RefreshToken", token));
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
                return FinFail<Unit>(ServiceError.NotFound("RefreshToken", token));

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
}
