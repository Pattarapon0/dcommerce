using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.DTO.Sellers;
using backend.Services.Sellers;
using System.Security.Claims;

namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/sellers")]
public class SellerController(ISellerService sellerService) : BaseController
{
    private readonly ISellerService _sellerService = sellerService;

    /// <summary>
    /// Create seller profile for current user
    /// </summary>
    /// <param name="request">Seller profile information</param>
    /// <returns>Created seller profile</returns>
    [HttpPost("profile")]
    [Authorize]
    public Task<ObjectResult> CreateSellerProfile([FromBody] CreateSellerProfileRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _sellerService.CreateSellerProfileAsync(request, userId));
    }

    /// <summary>
    /// Get current user's seller profile
    /// </summary>
    /// <returns>Seller profile details</returns>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetMySellerProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _sellerService.GetSellerProfileAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Update current user's seller profile
    /// </summary>
    /// <param name="request">Updated seller profile information</param>
    /// <returns>Updated seller profile</returns>
    [HttpPut("profile")]
    [Authorize]
    public Task<ObjectResult> UpdateSellerProfile([FromBody] UpdateSellerProfileRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _sellerService.UpdateSellerProfileAsync(request, userId));
    }

    /// <summary>
    /// Delete current user's seller profile
    /// </summary>
    /// <returns>Operation result</returns>
    [HttpDelete("profile")]
    [Authorize]
    public async Task<IActionResult> DeleteSellerProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _sellerService.DeleteSellerProfileAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Check if current user has seller profile
    /// </summary>
    /// <returns>Whether user is a seller</returns>
    [HttpGet("profile/exists")]
    [Authorize]
    public async Task<IActionResult> IsUserSeller()
    {
        var userId = GetCurrentUserId();
        var result = await _sellerService.IsUserSellerAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Get specific seller by ID (public)
    /// </summary>
    /// <param name="sellerId">Seller identifier</param>
    /// <returns>Seller profile details</returns>
    [HttpGet("{sellerId:guid}")]
    public async Task<IActionResult> GetSellerById(Guid sellerId)
    {
        var result = await _sellerService.GetSellerProfileByIdAsync(sellerId);
        return HandleResult(result);
    }

    /// <summary>
    /// Check if business name is available
    /// </summary>
    /// <param name="businessName">Business name to check</param>
    /// <returns>Whether business name is available</returns>
    [HttpGet("business-name-available/{businessName}")]
    [Authorize]
    public async Task<IActionResult> CheckBusinessNameAvailability(string businessName)
    {
        var userId = GetCurrentUserId();
        var result = await _sellerService.BusinessNameAvailableAsync(businessName, userId);
        return HandleResult(result);
    }
}