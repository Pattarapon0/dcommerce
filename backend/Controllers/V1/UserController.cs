using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.Services.User;
using backend.DTO.User;
using backend.DTO.Common;
using backend.Common.Results;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Amazon.S3.Model;

namespace backend.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UserController(IUserService userService) : BaseController
{
    private readonly IUserService _userService = userService;

    #region Profile Management

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType<ServiceSuccess<UserProfileDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.GetUserProfileAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType<ServiceSuccess<UserProfileDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> UpdateProfile([FromBody] UpdateUserProfileRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _userService.UpdateUserProfileAsync(userId, request));
    }

    /// <summary>
    /// Complete user profile (first time setup)
    /// </summary>
    [HttpPost("profile/complete")]
    [ProducesResponseType<ServiceSuccess<UserProfileDto>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> CompleteProfile([FromBody] CompleteProfileRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _userService.CompleteUserProfileAsync(userId, request));
    }

    #endregion

    #region Address Management

    /// <summary>
    /// Get current user's address
    /// </summary>
    [HttpGet("address")]
    [ProducesResponseType<ServiceSuccess<UserAddressDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetAddress()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.GetUserAddressAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Create user address
    /// </summary>
    [HttpPost("address")]
    [ProducesResponseType<ServiceSuccess<UserAddressDto>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> CreateAddress([FromBody] CreateUserAddressRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _userService.CreateUserAddressAsync(userId, request));
    }

    /// <summary>
    /// Update user address
    /// </summary>
    [HttpPut("address")]
    [ProducesResponseType<ServiceSuccess<UserAddressDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> UpdateAddress([FromBody] UpdateUserAddressRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _userService.UpdateUserAddressAsync(userId, request));
    }

    /// <summary>
    /// Delete user address
    /// </summary>
    [HttpDelete("address")]
    [ProducesResponseType<ServiceSuccess<object>>(204)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> DeleteAddress()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.DeleteUserAddressAsync(userId);
        return HandleResult(result);
    }

    #endregion

    #region Account Management

    /// <summary>
    /// Get current user summary
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType<ServiceSuccess<UserProfileDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetUserSummary()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.GetUserProfileAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Update user preferences
    /// </summary>
    [HttpPut("preferences")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> UpdatePreferences([FromBody] UpdateUserPreferencesRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _userService.UpdateUserPreferencesAsync(userId, request));
    }

    /// <summary>
    /// Deactivate current user account
    /// </summary>
    [HttpPost("deactivate")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> DeactivateAccount()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.DeactivateUserAsync(userId);
        return HandleResult(result);
    }

    #endregion

    #region Avatar Management

    /// <summary>
    /// Generate upload URL for user profile avatar
    /// </summary>
    [HttpPost("profile/avatar/upload-url")]
    [ProducesResponseType<ServiceSuccess<UploadUrlResponse>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GenerateAvatarUploadUrl([FromBody] GenerateAvatarUploadUrlRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _userService.GenerateAvatarUploadUrlAsync(userId, request.FileName);
        return HandleResult(result);
    }
    
    /// <summary>
    /// Delete user profile avatar
    /// </summary>
    [HttpDelete("profile/avatar")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> DeleteAvatar()
    {
        var userId = GetCurrentUserId();
        var result = await _userService.DeleteAvatarAsync(userId);
        return HandleResult(result);
    }

    #endregion
}