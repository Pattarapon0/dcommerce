using Microsoft.EntityFrameworkCore;
using backend.Data.Sellers.Entities;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Sellers;

public class SellerRepository(ECommerceDbContext context) : ISellerRepository
{
    private readonly ECommerceDbContext _context = context;

    public async Task<Fin<SellerProfile>> CreateAsync(SellerProfile sellerProfile)
    {
        try
        {
            _context.SellerProfiles.Add(sellerProfile);
            await _context.SaveChangesAsync();
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> GetByIdAsync(Guid id)
    {
        try
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);
            return seller != null
                ? FinSucc(seller)
                : FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", id.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return seller != null
                ? FinSucc(seller)
                : FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> UpdateAsync(SellerProfile sellerProfile)
    {
        try
        {
            _context.SellerProfiles.Update(sellerProfile);
            await _context.SaveChangesAsync();
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteByUserIdAsync(Guid userId)
    {
        try
        {
            var deleted = await _context.SellerProfiles
                .Where(s => s.UserId == userId)
                .ExecuteDeleteAsync();
            return deleted > 0 
                ? FinSucc(Unit.Default)
                : FinFail<Unit>(ServiceError.NotFound("SellerProfile", userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> ExistsByUserIdAsync(Guid userId)
    {
        try
        {
            var exists = await _context.SellerProfiles.AnyAsync(s => s.UserId == userId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> BusinessNameExistsAsync(string businessName, Guid? excludeUserId = null)
    {
        try
        {
            var query = _context.SellerProfiles
                .Where(s => s.BusinessName.ToLower() == businessName.ToLower());

            if (excludeUserId.HasValue)
                query = query.Where(s => s.UserId != excludeUserId.Value);

            var exists = await query.AnyAsync();
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> UpdateSellerProfileAsync(Guid userId, string businessName, string businessDescription)
    {
        try 
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
                
            if (seller == null)
                return FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", userId.ToString()));

            // Direct update - no pre-validation needed
            seller.BusinessName = businessName;
            seller.BusinessDescription = businessDescription;
            seller.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return FinSucc(seller);
        }
        catch (Exception ex) 
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> CreateSellerProfileAsync(Guid userId, string businessName, string? businessDescription = null)
    {
        try
        {
            // Pattern 2: Repository-level validation with fast fail
            
            // Check if user exists AND doesn't already have a seller profile
            var user = await _context.Users
                .Include(u => u.SellerProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);
                
            if (user == null)
                return FinFail<SellerProfile>(ServiceError.NotFound("User", userId.ToString()));
                
            if (user.SellerProfile != null)
                return FinFail<SellerProfile>(ServiceError.Conflict("User already has a seller profile"));

            // Check business name uniqueness
            var businessNameExists = await _context.SellerProfiles
                .AnyAsync(s => s.BusinessName.ToLower() == businessName.ToLower());
                
            if (businessNameExists)
                return FinFail<SellerProfile>(ServiceError.Conflict($"Business name '{businessName}' already exists"));

            // All validations passed - create seller profile
            var sellerProfile = new SellerProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BusinessName = businessName,
                BusinessDescription = businessDescription ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                User = user
            };

            _context.SellerProfiles.Add(sellerProfile);
            await _context.SaveChangesAsync();
            
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(bool UserIsSeller, bool BusinessNameExists)>> ValidateSellerCreationAsync(Guid userId, string businessName)
    {
        try
        {
            var userIsSellerTask = _context.SellerProfiles.AnyAsync(s => s.UserId == userId);
            var businessNameExistsTask = _context.SellerProfiles.AnyAsync(s => s.BusinessName.ToLower() == businessName.ToLower());

            await Task.WhenAll(userIsSellerTask, businessNameExistsTask);

            return FinSucc((userIsSellerTask.Result, businessNameExistsTask.Result));
        }
        catch (Exception ex)
        {
            return FinFail<(bool, bool)>(ServiceError.FromException(ex));
        }
    }
}