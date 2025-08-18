using backend.Data.Sellers;
using backend.Data.Sellers.Entities;
using backend.Data.User;
using backend.DTO.Sellers;
using backend.Common.Results;
using backend.Services.Images;
using backend.Common.Config;
using backend.DTO.Common;
using Microsoft.Extensions.Options;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Services.Sellers;

public class SellerService(ISellerRepository sellerRepository, IUserRepository userRepository, IImageService imageService, IOptions<ImageUploadOptions> uploadOptions) : ISellerService
{
    private readonly ISellerRepository _sellerRepository = sellerRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IImageService _imageService = imageService;
    private readonly ImageUploadOptions _uploadOptions = uploadOptions.Value;

    public async Task<Fin<SellerProfileDto>> CreateSellerProfileAsync(CreateSellerProfileRequest request, Guid userId)
    {
        // Pattern 2: Repository handles validation and creation with fast fail
        if (request.AvatarUrl != null)
        {
            return FinT<IO, string>.Lift(liftIO(() => ConfirmAvatarUploadAsync(userId, request.AvatarUrl))).Bind<SellerProfile>(avatarUrl =>
                liftIO(() => _sellerRepository.CreateSellerProfileAsync(
                   userId,
                   request.BusinessName.Trim(),
               request.BusinessDescription?.Trim() ?? string.Empty,
               avatarUrl
           ))).Map(MapToSellerProfileDto).Run().Run();
            
        }
        else
        {
            var result = await _sellerRepository.CreateSellerProfileAsync(
                userId,
                request.BusinessName.Trim(),
                request.BusinessDescription?.Trim()
            );
            return result.Map(MapToSellerProfileDto);
        }
    }

    public async Task<Fin<SellerProfileDto>> GetSellerProfileAsync(Guid userId)
    {
        var result = await _sellerRepository.GetByUserIdAsync(userId);
        return result.Map(MapToSellerProfileDto);
    }

    public async Task<Fin<SellerProfileDto>> GetSellerProfileByIdAsync(Guid sellerId)
    {
        var result = await _sellerRepository.GetByIdAsync(sellerId);
        return result.Map(MapToSellerProfileDto);
    }

    public Task<Fin<SellerProfileDto>> UpdateSellerProfileAsync(UpdateSellerProfileRequest request, Guid userId)
    {
        // Get existing profile first for partial update
        return FinT<IO, SellerProfile>.Lift(liftIO(() => _sellerRepository.GetByUserIdAsync(userId)))
            .Bind<SellerProfile>(
                existing =>
                {
                    var businessName = request.BusinessName?.Trim() ?? existing.BusinessName;
                    var businessDescription = request.BusinessDescription?.Trim() ?? existing.BusinessDescription;
                    return liftIO(() => _sellerRepository.UpdateSellerProfileAsync(
                        userId,
                        businessName,
                        businessDescription
                    ));
                }
            ).Map(MapToSellerProfileDto)
            .Run().Run().AsTask();

    }

    public Task<Fin<Unit>> DeleteSellerProfileAsync(Guid userId)
    {
        return FinT<IO, bool>.Lift(liftIO(() => _sellerRepository.ExistsByUserIdAsync(userId)))
        .Bind<Unit>(
            result => result ?
                liftIO(() => _sellerRepository.DeleteByUserIdAsync(userId)) :
                ServiceError.NotFound("SellerProfile", userId.ToString())
        ).Run().Run().AsTask();
    }

    public async Task<Fin<SellerDashboardDto>> GetDashboardAsync(Guid userId)
    {
        return await _sellerRepository.GetDashboardDataAsync(userId);
    }

    public async Task<Fin<bool>> IsUserSellerAsync(Guid userId)
    {
        var userResult = await _userRepository.GetByIdAsync(userId);
        return userResult.Map(user => user.IsApprovedSeller);  
    }

    public async Task<Fin<bool>> BusinessNameAvailableAsync(string businessName, Guid? excludeUserId = null)
    {
        var existsResult = await _sellerRepository.BusinessNameExistsAsync(businessName, excludeUserId);
        return existsResult.Map(exists => !exists);
    }

    private static SellerProfileDto MapToSellerProfileDto(SellerProfile sellerProfile)
    {
        return new SellerProfileDto
        {
            UserId = sellerProfile.UserId,
            BusinessName = sellerProfile.BusinessName,
            BusinessDescription = sellerProfile.BusinessDescription,
            AvatarUrl = sellerProfile.AvatarUrl,
            IsApproved = sellerProfile.User?.IsSellerApproved ?? false
        };
    }

    // Avatar Management Methods
    public async Task<Fin<UploadUrlResponse>> GenerateAvatarUploadUrlAsync(Guid userId, string fileName)
    {
        var url = await _imageService.GenerateUploadUrlAsync(fileName, userId, "seller-profiles");
        return url.Map(u => new UploadUrlResponse
        {
            Url = u,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            MaxFileSize = _uploadOptions.MaxFileSizeBytes,
            AllowedTypes = _uploadOptions.AllowedMimeTypes
        });
    }

    public Task<Fin<string>> ConfirmAvatarUploadAsync(Guid userId, string r2Url)
    {

        return FinT<IO, string>.Lift(liftIO(() => _imageService.ConfirmUploadAsync(r2Url, userId)))
            .Bind(url => (
                FinT<IO, SellerProfile>.Lift(liftIO(() => _sellerRepository.GetByUserIdAsync(userId)))
                .Bind<string>(seller => !string.IsNullOrEmpty(seller.AvatarUrl)
                    ? liftIO(() => _imageService.DeleteImageAsync(seller.AvatarUrl)).Map(_ => url) : FinSucc(url))
            )).Run().Run().AsTask();
    }

    public Task<Fin<Unit>> DeleteAvatarAsync(Guid userId)
    {
        return FinT<IO, SellerProfile>.Lift(liftIO(() => _sellerRepository.GetByUserIdAsync(userId)))
            .Bind<Unit>(seller => string.IsNullOrEmpty(seller.AvatarUrl)
                ? FinFail<Unit>(ServiceError.NotFound("Avatar", userId.ToString()))
                : liftIO(() => _imageService.DeleteImageAsync(seller.AvatarUrl).Map(_ => seller)).Bind<Unit>
                (seller =>
                {
                    seller.AvatarUrl = null;
                    return liftIO(() => _sellerRepository.UpdateAsync(seller)).Map(_ => Unit.Default);
                }))
            .Run().Run().AsTask();
    }
}