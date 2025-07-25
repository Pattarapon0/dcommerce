using backend.DTO.Sellers;
using LanguageExt;

namespace backend.Services.Sellers;

public interface ISellerService
{
    // Profile Management
    Task<Fin<SellerProfileDto>> CreateSellerProfileAsync(CreateSellerProfileRequest request, Guid userId);
    Task<Fin<SellerProfileDto>> GetSellerProfileAsync(Guid userId);
    Task<Fin<SellerProfileDto>> GetSellerProfileByIdAsync(Guid sellerId);
    Task<Fin<SellerProfileDto>> UpdateSellerProfileAsync(UpdateSellerProfileRequest request, Guid userId);
    Task<Fin<Unit>> DeleteSellerProfileAsync(Guid userId);

    // Validation and Business Logic
    Task<Fin<bool>> IsUserSellerAsync(Guid userId);
    Task<Fin<bool>> BusinessNameAvailableAsync(string businessName, Guid? excludeUserId = null);
}