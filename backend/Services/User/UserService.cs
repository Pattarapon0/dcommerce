using System.Reflection.Metadata;
using backend.Common.Results;
using backend.Data.User;
using backend.Data.User.Entities;
using backend.DTO.User;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Services.User;

public class UserService(IUserRepository userRepository) : IUserService
{
    private readonly IUserRepository _userRepository = userRepository;

    public async Task<Fin<UserProfileDto>> GetUserProfileAsync(Guid userId)
    {
        var userResult = await _userRepository.GetByIdAsync(userId);
        return userResult.Map(MapToUserProfileDto);
    }

    public Task<Fin<UserProfileDto>> UpdateUserProfileAsync(Guid userId, UpdateUserProfileRequest request)
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
                        user.Profile = newProfile;
                        return liftIO(_userRepository.CreateUserProfileAsync(newProfile))
                            .Map(profile => MapToUserProfileDto(user));
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
                        user.Profile.AvatarUrl = request.AvatarUrl ?? user.Profile.AvatarUrl;
                        user.Profile.SocialLinks = request.SocialLinks ?? user.Profile.SocialLinks;
                        return liftIO(_userRepository.UpdateUserProfileAsync(user.Profile))
                            .Map(_ => MapToUserProfileDto(user));
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
            City = request.City,
            Country = request.Country,
            PostalCode = request.PostalCode,
            State = "", // Add a default or make it part of the request
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
                    address.City = request.City?.Trim() ?? address.City;
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
                        // Update User entity fields (Language)
                        user.PreferredLanguage = request.Language ?? user.PreferredLanguage;
                        return liftIO(_userRepository.UpdateUserProfileAsync(user.Profile));
                          
                    }
                }
            ).Run().Run().AsTask();
    }

    private static UserProfileDto MapToUserProfileDto(backend.Data.User.Entities.User user)
    {
        return new UserProfileDto
        {
            // Core Identity
            UserId = user.Id,
            Email = user.Email,
            Username = user.Username,
            Role = user.Role,

            // Account Status
            IsActive = user.IsActive,
            IsVerified = user.IsVerified,
            CreatedAt = user.CreatedAt,
            LastLogin = user.LastLogin,

            // Profile Information
            FirstName = user.Profile?.FirstName,
            LastName = user.Profile?.LastName,
            FullName = user.FullName,
            PhoneNumber = user.Profile?.PhoneNumber,
            AvatarUrl = user.Profile?.AvatarUrl,

            // Profile Completion & OAuth
            ProfileComplete = !string.IsNullOrEmpty(user.Profile?.FirstName) &&
                            !string.IsNullOrEmpty(user.Profile?.LastName),
            IsOAuthUser = user.IsOAuthUser
        };
    }

    private static UserAddressDto MapToUserAddressDto(UserAddress address)
    {
        return new UserAddressDto
        {
            UserId = address.UserId,
            Address = address.AddressLine1,
            City = address.City,
            Country = address.Country,
            PostalCode = address.PostalCode,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt ?? DateTime.UtcNow
        };
    }
}