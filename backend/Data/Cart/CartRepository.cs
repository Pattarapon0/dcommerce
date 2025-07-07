using Microsoft.EntityFrameworkCore;
using server.Data.Cart.Entities;
using server.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;

namespace server.Data.Cart;

public class CartRepository(DbContext context) : ICartRepository
{
    private readonly DbContext _context = context;

    public async Task<Fin<IEnumerable<CartItem>>> GetUserCartAsync(Guid userId)
    {
        try
        {
            var items = await _context.Set<CartItem>()
                .Where(item => item.UserId == userId)
                .ToListAsync();
            return items != null && items.Count != 0
                ? FinSucc(items.AsEnumerable())
                : FinFail<IEnumerable<CartItem>>(ServiceError.NotFound("CartItems", userId.ToString()));
        }
        catch (Exception ex)
        {
            // Log the exception (not shown here for brevity)
            return FinFail<IEnumerable<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<CartItem>> GetCartItemAsync(Guid userId, Guid productId)
    {
        try
        {
            var item = await _context.Set<CartItem>()
                .FirstOrDefaultAsync(i => i.UserId == userId && i.ProductId == productId);
            return item != null
                ? FinSucc(item)
                : FinFail<CartItem>(ServiceError.NotFound("CartItem", $"{userId}, {productId}"));
        }
        catch (Exception ex)
        {
            // Log the exception (not shown here for brevity)
            return FinFail<CartItem>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<IEnumerable<CartItem>>> GetCartItemsBySellerAsync(Guid userId, Guid sellerId)
    {
        try
        {
            var items = await _context.Set<CartItem>()
                .Where(item => item.UserId == userId && item.Product.SellerId == sellerId)
                .ToListAsync();
            return items != null && items.Count != 0
                ? FinSucc(items.AsEnumerable())
                : FinFail<IEnumerable<CartItem>>(ServiceError.NotFound("CartItems", $"{userId}, {sellerId}"));
        }
        catch (Exception ex)
        {
            // Log the exception (not shown here for brevity)
            return FinFail<IEnumerable<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> ClearUserCartAsync(Guid userId)
    {
        try
        {
            int rowsAffected = await _context.Set<CartItem>()
                .Where(c => c.UserId == userId)
                .ExecuteDeleteAsync();
            return rowsAffected > 0 ? FinSucc(Unit.Default)
            : FinFail<Unit>(ServiceError.NotFound("CartItems", "UserId: " + userId.ToString()));
        }
        catch (Exception ex)
        {
            // Log the exception (not shown here for brevity)
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> RemoveCartItemAsync(Guid userId, Guid productId)
    {
        try
        {
            int deleted = await _context.Set<CartItem>()
            .Where(c => c.UserId == userId && c.ProductId == productId)
            .ExecuteDeleteAsync();

            return deleted > 0 ? Fin<bool>.Succ(true)
            : FinFail<bool>(ServiceError.NotFound("CartItem", $"{userId}, {productId}"));

        }
        catch (Exception ex)
        {
            // Log the exception (not shown here for brevity)
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }
}