using backend.Data.Sellers.Entities;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Sellers;

public interface ISellerRepository
{
    // Basic CRUD Operations
    Task<Fin<SellerProfile>> CreateAsync(SellerProfile sellerProfile);
    Task<Fin<SellerProfile>> GetByIdAsync(Guid id);
    Task<Fin<SellerProfile>> GetByUserIdAsync(Guid userId);
    Task<Fin<SellerProfile>> UpdateAsync(SellerProfile sellerProfile);
    Task<Fin<Unit>> DeleteByUserIdAsync(Guid userId);

    // Pattern 2: Repository-level validation with fast fail
    Task<Fin<SellerProfile>> CreateSellerProfileAsync(Guid userId, string businessName, string? businessDescription = null,string? avatarUrl = null);
    
    // Pattern 3: Direct repository update
    Task<Fin<SellerProfile>> UpdateSellerProfileAsync(Guid userId, string businessName, string businessDescription);

    // Validation and Business Logic
    Task<Fin<bool>> ExistsByUserIdAsync(Guid userId);
    Task<Fin<bool>> BusinessNameExistsAsync(string businessName, Guid? excludeUserId = null);
    Task<Fin<(bool UserIsSeller, bool BusinessNameExists)>> ValidateSellerCreationAsync(Guid userId, string businessName);
}