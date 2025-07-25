using backend.Data.Cart.Entities;
using backend.DTO.Cart;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Cart;

public interface ICartRepository
{
    // Basic Cart Operations
    Task<Fin<CartItem>> AddItemAsync(CartItem cartItem);
    Task<Fin<CartItem>> GetCartItemAsync(Guid userId, Guid productId);
    Task<Fin<CartItem>> GetCartItemByIdAsync(Guid cartItemId, Guid userId);
    Task<Fin<List<CartItem>>> GetUserCartAsync(Guid userId);
    Task<Fin<List<CartItem>>> GetUserCartLightAsync(Guid userId);
    Task<Fin<Unit>> UpdateCartItemAsync(CartItem cartItem);
    Task<Fin<Unit>> RemoveCartItemAsync(Guid cartItemId);
    Task<Fin<Unit>> RemoveCartItemByProductAsync(Guid userId, Guid productId);

    // Bulk Operations
    Task<Fin<Unit>> ClearUserCartAsync(Guid userId);
    Task<Fin<List<CartItem>>> GetCartItemsBySellerAsync(Guid userId, Guid sellerId);
    Task<Fin<Unit>> RemoveCartItemsBySellerAsync(Guid userId, Guid sellerId);
    Task<Fin<Unit>> BulkRemoveCartItemsAsync(List<Guid> cartItemIds);

    // Validation and Business Logic
    Task<Fin<bool>> CartItemExistsAsync(Guid userId, Guid productId);
    Task<Fin<bool>> IsCartItemOwnedByUserAsync(Guid cartItemId, Guid userId);
    Task<Fin<int>> GetCartTotalCountAsync(Guid userId);
    Task<Fin<decimal>> GetCartTotalValueAsync(Guid userId);
    Task<Fin<CartLimitsInfo>> GetCartLimitsInfoAsync(Guid userId);
    Task<Fin<List<(Guid ProductId, int Quantity)>>> GetCartItemsForOrderAsync(Guid userId);

    // Stock Validation
    Task<Fin<List<CartItem>>> GetCartItemsWithStockCheckAsync(Guid userId);
    Task<Fin<bool>> ValidateCartItemStockAsync(Guid cartItemId);

    // Cleanup Operations
    Task<Fin<Unit>> RemoveInvalidCartItemsAsync(Guid userId);
    Task<Fin<Unit>> CleanupExpiredCartItemsAsync(DateTime beforeDate);
}