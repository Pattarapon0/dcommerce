using System.Reflection.Metadata;
using backend.Common.Results;
using backend.Data.User;
using backend.Data.User.Entities;
using backend.DTO.User;
using backend.DTO.Common;
using backend.Services.Images;
using backend.Common.Config;
using Microsoft.Extensions.Options;
using LanguageExt;
using static LanguageExt.Prelude;
using LanguageExt.Pretty;

namespace backend.Services.User;

public class UserService(IUserRepository userRepository, IImageService imageService, IOptions<ImageUploadOptions> uploadOptions) : IUserService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IImageService _imageService = imageService;
    private readonly ImageUploadOptions _uploadOptions = uploadOptions.Value;

    public async Task<Fin<UserProfileDto>> GetUserProfileAsync(Guid userId)
    {
        var userResult = await _userRepository.GetByIdAsync(userId);
        return userResult.Map(MapToUserProfileDto);
    }

    public Task<Fin<UserProfileDto>> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request)
    {
        return FinT<IO, Data.User.Entities.User>.Lift(liftIO(() => _userRepository.GetByIdAsync(userId)))
            .Bind<Data.User.Entities.User>(user => user.Profile != null && !string.IsNullOrEmpty(user.Profile.AvatarUrl) && request.AvatarUrl != user.Profile.AvatarUrl
                ? liftIO(() => _imageService.DeleteImageAsync(user.Profile.AvatarUrl)).Map(_ => user)
                : request == null || string.IsNullOrEmpty(request.AvatarUrl) || (user.Profile != null && request.AvatarUrl == user.Profile.AvatarUrl)
                    ? FinSucc(user)
                    : FinT<IO, string>.Lift(liftIO(() => _imageService.ConfirmUploadAsync(request.AvatarUrl, user.Id))).Bind<Data.User.Entities.User>(url =>
                    {
                        request.AvatarUrl = url;
                        return user;
                    }))
            .Bind<UserProfileDto>(
                user =>
                {
                    Console.WriteLine($"Updating profile for user {user.Profile?.AvatarUrl}");
                    Console.WriteLine($"Request data: {request.AvatarUrl}");
                    if (user.Profile == null)
                    {
                        // Create new profile if it doesn't exist
                        var newProfile = new UserProfile
                        {
                            FirstName = request.FirstName ?? "",
                            LastName = request.LastName ?? "",
                            PhoneNumber = request.PhoneNumber,
                            DateOfBirth = request.DateOfBirth,
                            Bio = request.Bio,
                            Website = request.Website,
                            Timezone = request.Timezone,
                            AvatarUrl = request.AvatarUrl,
                            SocialLinks = request.SocialLinks,
                            User = user
                        };

                        // Update User-level fields
                        if (request.PreferredCurrency.HasValue)
                        {
                            user.PreferredCurrency = request.PreferredCurrency.Value;
                        }

                        user.Profile = newProfile;
                        return liftIO(async () =>
                        {
                            var profileResult = await _userRepository.CreateUserProfileAsync(newProfile);
                            if (profileResult.IsFail) return profileResult;

                            var userResult = await _userRepository.UpdateAsync(user);
                            return userResult.IsSucc
                                ? profileResult
                                : FinFail<UserProfile>(ServiceError.Internal("Failed to update user"));
                        }).Map(profile => MapToUserProfileDto(user));
                    }
                    else
                    {
                        // Update existing profile
                        user.Profile.FirstName = request.FirstName ?? user.Profile.FirstName;
                        user.Profile.LastName = request.LastName ?? user.Profile.LastName;
                        user.Profile.PhoneNumber = request.PhoneNumber ?? user.Profile.PhoneNumber;
                        user.Profile.DateOfBirth = request.DateOfBirth ?? user.Profile.DateOfBirth;
                        user.Profile.Bio = request.Bio ?? user.Profile.Bio;
                        user.Profile.Website = request.Website ?? user.Profile.Website;
                        user.Profile.Timezone = request.Timezone ?? user.Profile.Timezone;
                        user.Profile.AvatarUrl = request.AvatarUrl;
                        user.Profile.SocialLinks = request.SocialLinks ?? user.Profile.SocialLinks;

                        // Update User-level fields
                        if (request.PreferredCurrency.HasValue)
                        {
                            user.PreferredCurrency = request.PreferredCurrency.Value;
                        }

                        // Update both Profile and User entities
                        return liftIO(async () =>
                        {
                            var profileResult = await _userRepository.UpdateUserProfileAsync(user.Profile);
                            var userResult = await _userRepository.UpdateAsync(user);
                            return profileResult.IsSucc && userResult.IsSucc
                                ? FinSucc(Unit.Default)
                                : FinFail<Unit>(ServiceError.Internal("Failed to update profile"));
                        }).Map(_ => MapToUserProfileDto(user));
                    }
                }
            ).Run().Run().AsTask();

    }

    public Task<Fin<UserProfileDto>> CompleteUserProfileAsync(Guid userId, CompleteProfileRequest request)
    {
        return FinT<IO, backend.Data.User.Entities.User>.Lift(liftIO(() => _userRepository.GetByIdAsync(userId)))
            .Bind<UserProfileDto>(
                user =>
                {
                    if (user.Profile == null)
                    {
                        // Create new profile if it doesn't exist
                        var newProfile = new UserProfile
                        {
                            Country = request.Country ?? "thailand",
                            PhoneNumber = request.PhoneNumber,
                            DateOfBirth = request.DateOfBirth,
                            User = user
                        };
                        return liftIO(_userRepository.CreateUserProfileAsync(newProfile))
                            .Map(profile => MapToUserProfileDto(user));
                    }
                    else
                    {
                        // Update existing profile
                        user.Profile.Country = request.Country ?? user.Profile.Country;
                        user.Profile.PhoneNumber = request.PhoneNumber ?? user.Profile.PhoneNumber;
                        user.Profile.DateOfBirth = request.DateOfBirth ?? user.Profile.DateOfBirth;
                        return liftIO(_userRepository.UpdateUserProfileAsync(user.Profile))
                            .Map(_ => MapToUserProfileDto(user));
                    }
                }
            ).Run().Run().AsTask();

    }

    public async Task<Fin<UserAddressDto>> CreateUserAddressAsync(Guid userId, CreateUserAddressRequest request)
    {
        var address = new UserAddress
        {
            UserId = userId,
            AddressLine1 = request.Address,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode,
            User = null! // This will be resolved by EF
        };

        var result = await _userRepository.CreateUserAddressAsync(address);
        return result.Map(MapToUserAddressDto);
    }

    public async Task<Fin<UserAddressDto>> GetUserAddressAsync(Guid userId)
    {
        var result = await _userRepository.GetUserAddressAsyncByUserId(userId);
        return result.Map(MapToUserAddressDto);
    }

    public Task<Fin<UserAddressDto>> UpdateUserAddressAsync(Guid userId, UpdateUserAddressRequest request)
    {
        return FinT<IO, UserAddress>.Lift(liftIO(() => _userRepository.GetUserAddressAsyncByUserId(userId)))
            .Bind<UserAddressDto>(
                address =>
                {
                    address.AddressLine1 = request.Address?.Trim() ?? address.AddressLine1;
                    address.AddressLine2 = request.AddressLine2?.Trim() ?? address.AddressLine2;
                    address.City = request.City?.Trim() ?? address.City;
                    address.State = request.State?.Trim() ?? address.State;
                    address.Country = request.Country?.Trim() ?? address.Country;
                    address.PostalCode = request.PostalCode?.Trim() ?? address.PostalCode;

                    return liftIO(() => _userRepository.UpdateUserAddressAsync(address)).Map(_ => MapToUserAddressDto(address));
                }
            ).Run().Run().AsTask();

    }

    public async Task<Fin<Unit>> DeleteUserAddressAsync(Guid userId)
    {
        return await _userRepository.DeleteUserAddressAsyncByUserId(userId);
    }

    public async Task<Fin<Unit>> DeactivateUserAsync(Guid userId)
    {
        return await _userRepository.DeactivateUserAsync(userId);
    }
    public Task<Fin<Unit>> UpdateUserPreferencesAsync(Guid userId, UpdateUserPreferencesRequest request)
    {
        return FinT<IO, backend.Data.User.Entities.User>.Lift(liftIO(() => _userRepository.GetByIdAsync(userId)))
            .Bind<Unit>(
                user =>
                {
                    if (user.Profile == null)
                    {
                        // Create new profile if it doesn't exist
                        var newProfile = new UserProfile
                        {
                            Timezone = request.Timezone,
                            User = user
                        };
                        return liftIO(_userRepository.CreateUserProfileAsync(newProfile))
                            .Map(_ => Unit.Default);
                    }
                    else
                    {
                        // Update existing profile
                        user.Profile.Timezone = request.Timezone ?? user.Profile.Timezone;
                        // Update User entity fields (Language always defaults to English)
                        user.PreferredLanguage = "en";
                        return liftIO(_userRepository.UpdateUserProfileAsync(user.Profile));

                    }
                }
            ).Run().Run().AsTask();
    }

    private static UserProfileDto MapToUserProfileDto(backend.Data.User.Entities.User user)
    {
        return new UserProfileDto
        {
            // Core Identity (Essential)
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,

            // Account Status (Essential)
            IsActive = user.IsActive,
            IsVerified = user.IsVerified,

            // Profile Information (Essential)
            FirstName = user.Profile?.FirstName,
            LastName = user.Profile?.LastName,
            FullName = user.FullName,
            PhoneNumber = user.Profile?.PhoneNumber,
            AvatarUrl = user.Profile?.AvatarUrl,
            DateOfBirth = user.Profile?.DateOfBirth,
            PreferredCurrency = user.PreferredCurrency,

            IsSellerApproved = user.IsSellerApproved,
            BusinessName = user.SellerProfile != null ? user.SellerProfile.BusinessName ?? string.Empty : string.Empty,
            BusinessDescription = user.SellerProfile != null ? user.SellerProfile.BusinessDescription ?? string.Empty : string.Empty,
            BusinessAvatarUrl = user.SellerProfile != null ? user.SellerProfile.AvatarUrl ?? string.Empty : string.Empty
        };
    }

    private static UserAddressDto MapToUserAddressDto(UserAddress address)
    {
        return new UserAddressDto
        {
            UserId = address.UserId,
            Address = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            Country = address.Country,
            PostalCode = address.PostalCode,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt ?? DateTime.UtcNow
        };
    }

    // Avatar Management Methods
    public async Task<Fin<UploadUrlResponse>> GenerateAvatarUploadUrlAsync(Guid userId, string fileName)
    {
        var url = await _imageService.GenerateUploadUrlAsync(fileName, userId, "profiles");
        return url.Map(u => new UploadUrlResponse
        {
            Url = u,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            MaxFileSize = _uploadOptions.MaxFileSizeBytes,
            AllowedTypes = _uploadOptions.AllowedMimeTypes
        });
    }
    
    //unused
    public Task<Fin<Unit>> DeleteAvatarAsync(Guid userId)
    {
        return FinT<IO, Data.User.Entities.User>.Lift(liftIO(() => _userRepository.GetByIdAsync(userId)))
            .Bind<Data.User.Entities.User>(user => user.Profile == null
                ? FinFail<backend.Data.User.Entities.User>(ServiceError.NotFound("UserProfile", userId.ToString()))
                : FinSucc(user))
            .Bind<Unit>(user => string.IsNullOrEmpty(user?.Profile?.AvatarUrl)
                ? FinFail<Unit>(ServiceError.NotFound("Avatar", userId.ToString()))
                : liftIO(() => _imageService.DeleteImageAsync(user.Profile.AvatarUrl).Map(_ => user)).Bind<Unit>
                (user =>
                {
                    if (user.Profile != null)
                    {
                        user.Profile.AvatarUrl = null;
                    }
                    return liftIO(() => _userRepository.UpdateAsync(user)).Map(_ => Unit.Default);
                }))
            .Run().Run().AsTask();
    }
}