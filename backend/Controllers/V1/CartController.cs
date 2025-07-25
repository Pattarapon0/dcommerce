using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.DTO.Cart;
using backend.Services.Cart;
using System.Security.Claims;

namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/cart")]
[Authorize]
public class CartController(ICartService cartService) : BaseController
{
    private readonly ICartService _cartService = cartService;

    /// <summary>
    /// Add item to cart
    /// </summary>
    /// <param name="request">Product and quantity to add</param>
    /// <returns>Added cart item details</returns>
    [HttpPost("items")]
    public Task<ObjectResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _cartService.AddToCartAsync(request, userId));
    }

    /// <summary>
    /// Get user's cart summary with validation status
    /// </summary>
    /// <returns>Complete cart summary with items grouped by seller and validation info</returns>
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetCurrentUserId();
        var result = await _cartService.GetUserCartAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Get specific cart item
    /// </summary>
    /// <param name="cartItemId">Cart item identifier</param>
    /// <returns>Cart item details</returns>
    [HttpGet("items/{cartItemId:guid}")]
    public async Task<IActionResult> GetCartItem(Guid cartItemId)
    {
        var userId = GetCurrentUserId();
        var result = await _cartService.GetCartItemAsync(cartItemId, userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Update cart item quantity
    /// </summary>
    /// <param name="cartItemId">Cart item identifier</param>
    /// <param name="request">New quantity</param>
    /// <returns>Updated cart item details</returns>
    [HttpPut("items/{cartItemId:guid}")]
    public Task<ObjectResult> UpdateCartItem(Guid cartItemId, [FromBody] UpdateCartItemRequest request)
    {
        var userId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _cartService.UpdateCartItemAsync(cartItemId, request, userId));
    }

    /// <summary>
    /// Remove specific cart item
    /// </summary>
    /// <param name="cartItemId">Cart item identifier</param>
    /// <returns>Operation result</returns>
    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveCartItem(Guid cartItemId)
    {
        var userId = GetCurrentUserId();
        var result = await _cartService.RemoveCartItemAsync(cartItemId, userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Remove cart item by product ID
    /// </summary>
    /// <param name="productId">Product identifier</param>
    /// <returns>Updated cart summary</returns>
    [HttpDelete("products/{productId:guid}")]
    public async Task<IActionResult> RemoveCartItemByProduct(Guid productId)
    {
        var userId = GetCurrentUserId();
        var removeResult = await _cartService.RemoveCartItemByProductAsync(productId, userId);
        
        if (removeResult.IsFail)
            return HandleResult(removeResult);
            
        // Return updated cart after removal
        var cartResult = await _cartService.GetUserCartAsync(userId);
        return HandleResult(cartResult);
    }

    /// <summary>
    /// Clear entire cart
    /// </summary>
    /// <returns>Operation result</returns>
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetCurrentUserId();
        var result = await _cartService.ClearCartAsync(userId);
        return HandleResult(result);
    }

    /// <summary>
    /// Get cart checkout summary (validates cart and returns detailed info)
    /// </summary>
    /// <returns>Cart summary ready for checkout with validation details</returns>
    [HttpGet("checkout-summary")]
    public async Task<IActionResult> GetCartCheckoutSummary()
    {
        var userId = GetCurrentUserId();
        var result = await _cartService.GetCartCheckoutSummaryAsync(userId);
        return HandleResult(result);
    }
}