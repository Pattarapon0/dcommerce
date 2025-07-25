using backend.DTO.Cart;
using LanguageExt;

namespace backend.Services.Cart;

public interface ICartService
{
    // Core Cart Operations
    Task<Fin<CartItemDto>> AddToCartAsync(AddToCartRequest request, Guid userId);
    Task<Fin<CartSummaryDto>> GetUserCartAsync(Guid userId);
    Task<Fin<CartItemDto>> GetCartItemAsync(Guid cartItemId, Guid userId);
    Task<Fin<CartItemDto>> UpdateCartItemAsync(Guid cartItemId, UpdateCartItemRequest request, Guid userId);
    Task<Fin<Unit>> RemoveCartItemAsync(Guid cartItemId, Guid userId);
    Task<Fin<Unit>> RemoveCartItemByProductAsync(Guid productId, Guid userId);
    Task<Fin<Unit>> ClearCartAsync(Guid userId);

    // Enhanced Operations
    Task<Fin<CartSummaryDto>> GetCartCheckoutSummaryAsync(Guid userId);
    Task<Fin<Unit>> MergeGuestCartAsync(List<AddToCartRequest> guestCartItems, Guid userId);
}