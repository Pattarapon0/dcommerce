using backend.DTO.Sellers;
using backend.DTO.Common;
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

    // Dashboard Analytics
    Task<Fin<SellerDashboardDto>> GetDashboardAsync(Guid userId);

    // Validation and Business Logic
    Task<Fin<bool>> IsUserSellerAsync(Guid userId);
    Task<Fin<bool>> BusinessNameAvailableAsync(string businessName, Guid? excludeUserId = null);

    // Seller Avatar Management
    Task<Fin<UploadUrlResponse>> GenerateAvatarUploadUrlAsync(Guid userId, string fileName);
    Task<Fin<string>> ConfirmAvatarUploadAsync(Guid userId, string r2Url);
    Task<Fin<Unit>> DeleteAvatarAsync(Guid userId);
}