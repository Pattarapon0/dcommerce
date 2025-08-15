using backend.Common.Results;
using backend.Data.User.Entities;
using backend.DTO.User;
using backend.DTO.Common;
using LanguageExt;

namespace backend.Services.User;

public interface IUserService
{
    // User Profile Management
    Task<Fin<UserProfileDto>> GetUserProfileAsync(Guid userId);
    Task<Fin<UserProfileDto>> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request);
    Task<Fin<UserProfileDto>> CompleteUserProfileAsync(Guid userId, CompleteProfileRequest request);

    // User Address Management
    Task<Fin<UserAddressDto>> CreateUserAddressAsync(Guid userId, CreateUserAddressRequest request);
    Task<Fin<UserAddressDto>> GetUserAddressAsync(Guid userId);
    Task<Fin<UserAddressDto>> UpdateUserAddressAsync(Guid userId, UpdateUserAddressRequest request);
    Task<Fin<Unit>> DeleteUserAddressAsync(Guid userId);

    // User Account Management
    Task<Fin<Unit>> DeactivateUserAsync(Guid userId);
    Task<Fin<Unit>> UpdateUserPreferencesAsync(Guid userId, UpdateUserPreferencesRequest request);

    // User Avatar Management
    Task<Fin<UploadUrlResponse>> GenerateAvatarUploadUrlAsync(Guid userId, string fileName);
    Task<Fin<AvatarUploadResponse>> ConfirmAvatarUploadAsync(Guid userId, string r2Url);
    Task<Fin<Unit>> DeleteAvatarAsync(Guid userId);
}