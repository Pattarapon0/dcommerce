using Microsoft.EntityFrameworkCore;
using backend.Data.Cart.Entities;
using backend.Common.Results;
using backend.DTO.Cart;
using LanguageExt;
using static LanguageExt.Prelude;
using LanguageExt.Effects;

namespace backend.Data.Cart;

public class CartRepository(ECommerceDbContext context) : ICartRepository
{
    private readonly ECommerceDbContext _context = context;

    public async Task<Fin<CartItem>> AddItemAsync(CartItem cartItem)
    {
        try
        {
            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();
            return FinSucc(cartItem);
        }
        catch (Exception ex)
        {
            return FinFail<CartItem>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<CartItem>> GetCartItemAsync(Guid userId, Guid productId)
    {
        try
        {
            var item = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Seller)
                .ThenInclude(s => s.SellerProfile)
                .FirstOrDefaultAsync(i => i.UserId == userId && i.ProductId == productId);
            return item != null
                ? FinSucc(item)
                : FinFail<CartItem>(ServiceError.NotFound("CartItem", $"{userId}, {productId}"));
        }
        catch (Exception ex)
        {
            return FinFail<CartItem>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<CartItem>> GetCartItemByIdAsync(Guid cartItemId, Guid userId)
    {
        try
        {
            var item = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Seller)
                .ThenInclude(s => s.SellerProfile)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);
            return item != null
                ? FinSucc(item)
                : FinFail<CartItem>(ServiceError.NotFound("CartItem", cartItemId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<CartItem>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<CartItem>>> GetUserCartAsync(Guid userId)
    {
        try
        {
            var items = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Seller)
                .ThenInclude(s => s.SellerProfile)
                .Where(item => item.UserId == userId)
                .OrderBy(ci => ci.CreatedAt)
                .ToListAsync();
            return FinSucc(items);
        }
        catch (Exception ex)
        {
            return FinFail<List<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<CartItem>>> GetUserCartLightAsync(Guid userId)
    {
        try
        {
            var items = await _context.CartItems
                .Where(item => item.UserId == userId)
                .OrderBy(ci => ci.CreatedAt)
                .ToListAsync();
            return FinSucc(items);
        }
        catch (Exception ex)
        {
            return FinFail<List<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateCartItemAsync(CartItem cartItem)
    {
        try
        {
            _context.CartItems.Update(cartItem);
            await _context.SaveChangesAsync();
            return FinSucc(Unit.Default);
        }
        catch (DbUpdateConcurrencyException)
        {
            return FinFail<Unit>(ServiceError.Conflict("Cart item was modified by another process. Please refresh and try again."));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RemoveCartItemAsync(Guid cartItemId)
    {
        try
        {
            var deleted = await _context.CartItems
                .Where(ci => ci.Id == cartItemId)
                .ExecuteDeleteAsync();
            return deleted > 0
                ? FinSucc(Unit.Default)
                : FinFail<Unit>(ServiceError.NotFound("CartItem", cartItemId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RemoveCartItemByProductAsync(Guid userId, Guid productId)
    {
        try
        {
            var deleted = await _context.CartItems
                .Where(ci => ci.UserId == userId && ci.ProductId == productId)
                .ExecuteDeleteAsync();
            return deleted > 0
                ? FinSucc(Unit.Default)
                : FinFail<Unit>(ServiceError.NotFound("CartItem", $"{userId}, {productId}"));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> ClearUserCartAsync(Guid userId)
    {
        try
        {
            await _context.CartItems
                .Where(c => c.UserId == userId)
                .ExecuteDeleteAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<CartItem>>> GetCartItemsBySellerAsync(Guid userId, Guid sellerId)
    {
        try
        {
            var items = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Seller)
                .ThenInclude(s => s.SellerProfile)
                .Where(item => item.UserId == userId && item.Product.SellerId == sellerId)
                .ToListAsync();
            return FinSucc(items);
        }
        catch (Exception ex)
        {
            return FinFail<List<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RemoveCartItemsBySellerAsync(Guid userId, Guid sellerId)
    {
        try
        {
            await _context.CartItems
                .Where(ci => ci.UserId == userId && ci.Product.SellerId == sellerId)
                .ExecuteDeleteAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> BulkRemoveCartItemsAsync(List<Guid> cartItemIds)
    {
        try
        {
            await _context.CartItems
                .Where(ci => cartItemIds.Contains(ci.Id))
                .ExecuteDeleteAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> CartItemExistsAsync(Guid userId, Guid productId)
    {
        try
        {
            var exists = await _context.CartItems
                .AnyAsync(ci => ci.UserId == userId && ci.ProductId == productId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> IsCartItemOwnedByUserAsync(Guid cartItemId, Guid userId)
    {
        try
        {
            var exists = await _context.CartItems
                .AnyAsync(ci => ci.Id == cartItemId && ci.UserId == userId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<int>> GetCartTotalCountAsync(Guid userId)
    {
        try
        {
            var count = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .SumAsync(ci => ci.Quantity);
            return FinSucc(count);
        }
        catch (Exception ex)
        {
            return FinFail<int>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<decimal>> GetCartTotalValueAsync(Guid userId)
    {
        try
        {
            var total = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .SumAsync(ci => ci.Quantity * ci.Product.Price);
            return FinSucc(total);
        }
        catch (Exception ex)
        {
            return FinFail<decimal>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<CartLimitsInfo>> GetCartLimitsInfoAsync(Guid userId)
    {
        try
        {
            var result = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .GroupBy(ci => ci.UserId)
                .Select(g => new CartLimitsInfo
                {
                    UniqueProductCount = g.Count(),
                    TotalItemCount = g.Sum(ci => ci.Quantity),
                    TotalValue = g.Sum(ci => ci.Quantity * ci.Product.Price)
                })
                .FirstOrDefaultAsync();

            return FinSucc(result ?? new CartLimitsInfo());
        }
        catch (Exception ex)
        {
            return FinFail<CartLimitsInfo>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<(Guid ProductId, int Quantity)>>> GetCartItemsForOrderAsync(Guid userId)
    {
        try
        {
            var items = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .Select(ci => new { ci.ProductId, ci.Quantity })
                .ToListAsync();

            var result = items.Select(x => (x.ProductId, x.Quantity)).ToList();
            return FinSucc(result);
        }
        catch (Exception ex)
        {
            return FinFail<List<(Guid ProductId, int Quantity)>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<CartItem>>> GetCartItemsWithStockCheckAsync(Guid userId)
    {
        try
        {
            var items = await _context.CartItems
                .Include(ci => ci.Product)
                .ThenInclude(p => p.Seller)
                .ThenInclude(s => s.SellerProfile)
                .Where(ci => ci.UserId == userId && ci.Product.IsActive && ci.Product.Stock >= ci.Quantity)
                .ToListAsync();
            return FinSucc(items);
        }
        catch (Exception ex)
        {
            return FinFail<List<CartItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> ValidateCartItemStockAsync(Guid cartItemId)
    {
        try
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null)
                return FinFail<bool>(ServiceError.NotFound("CartItem", cartItemId.ToString()));

            var hasStock = cartItem.Product.IsActive && cartItem.Product.Stock >= cartItem.Quantity;
            return FinSucc(hasStock);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> RemoveInvalidCartItemsAsync(Guid userId)
    {
        try
        {
            await _context.CartItems
                .Where(ci => ci.UserId == userId &&
                    (!ci.Product.IsActive || ci.Product.Stock < ci.Quantity))
                .ExecuteDeleteAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> CleanupExpiredCartItemsAsync(DateTime beforeDate)
    {
        try
        {
            await _context.CartItems
                .Where(ci => ci.CreatedAt < beforeDate)
                .ExecuteDeleteAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }
}