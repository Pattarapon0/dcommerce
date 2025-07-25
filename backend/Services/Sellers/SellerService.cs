using backend.Data.Sellers;
using backend.Data.Sellers.Entities;
using backend.DTO.Sellers;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Services.Sellers;

public class SellerService(ISellerRepository sellerRepository) : ISellerService
{
    private readonly ISellerRepository _sellerRepository = sellerRepository;

    public async Task<Fin<SellerProfileDto>> CreateSellerProfileAsync(CreateSellerProfileRequest request, Guid userId)
    {
        // Pattern 2: Repository handles validation and creation with fast fail
        var result = await _sellerRepository.CreateSellerProfileAsync(
            userId,
            request.BusinessName.Trim(),
            request.BusinessDescription?.Trim()
        );
        return result.Map(MapToSellerProfileDto);
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

    public async Task<Fin<bool>> IsUserSellerAsync(Guid userId)
    {
        return await _sellerRepository.ExistsByUserIdAsync(userId);
    }

    public async Task<Fin<bool>> BusinessNameAvailableAsync(string businessName, Guid? excludeUserId = null)
    {
        var existsResult = await _sellerRepository.BusinessNameExistsAsync(businessName, excludeUserId);
        return existsResult.Match(
            exists => FinSucc(!exists),
            error => FinFail<bool>(error)
        );
    }

    private static SellerProfileDto MapToSellerProfileDto(SellerProfile sellerProfile)
    {
        return new SellerProfileDto
        {
            Id = sellerProfile.Id,
            UserId = sellerProfile.UserId,
            BusinessName = sellerProfile.BusinessName,
            BusinessDescription = sellerProfile.BusinessDescription,
            UserFirstName = sellerProfile.User?.Profile?.FirstName ?? string.Empty,
            UserLastName = sellerProfile.User?.Profile?.LastName ?? string.Empty,
            UserEmail = sellerProfile.User?.Email ?? string.Empty,
            CreatedAt = sellerProfile.CreatedAt,
            UpdatedAt = sellerProfile.UpdatedAt ?? DateTime.UtcNow
        };
    }
}