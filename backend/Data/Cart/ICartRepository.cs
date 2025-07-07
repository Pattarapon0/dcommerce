using server.Data.User.Entities;
using LanguageExt;
using server.Data.Cart.Entities;

namespace server.Data.Cart;

public interface ICartRepository
{
    // Basic Cart Operations
    Task<Fin<IEnumerable<CartItem>>> GetUserCartAsync(Guid userId);
    Task<Fin<CartItem>> GetCartItemAsync(Guid userId, Guid productId);
    Task<Fin<IEnumerable<CartItem>>> GetCartItemsBySellerAsync(Guid userId, Guid sellerId);
    Task<Fin<Unit>> ClearUserCartAsync(Guid userId);
    Task<Fin<bool>> RemoveCartItemAsync(Guid userId, Guid productId);
}