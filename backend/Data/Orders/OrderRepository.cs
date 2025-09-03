using Microsoft.EntityFrameworkCore;
using backend.Data.Orders.Entities;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Orders;

public class OrderRepository(ECommerceDbContext context) : IOrderRepository
{
    private readonly ECommerceDbContext _context = context;

    public async Task<Fin<Order>> CreateAsync(Order order)
    {
        try
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return FinSucc(order);
        }
        catch (Exception ex)
        {
            return FinFail<Order>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Order>> CreateOrderWithStockUpdateAsync(Order order, List<(Guid ProductId, int Quantity)> stockUpdates)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Orders.Add(order);

            foreach (var (productId, quantity) in stockUpdates)
            {
                await _context.Products
                    .Where(p => p.Id == productId)
                    .ExecuteUpdateAsync(p => p.SetProperty(x => x.Stock, x => x.Stock - quantity));
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return FinSucc(order);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return FinFail<Order>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Order>> CreateOrderFromCartWithStockUpdateAsync(Order order, List<(Guid ProductId, int Quantity)> stockUpdates, Guid buyerId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Create the order
            _context.Orders.Add(order);

            // 2. Update product stock
            foreach (var (productId, quantity) in stockUpdates)
            {
                await _context.Products
                    .Where(p => p.Id == productId)
                    .ExecuteUpdateAsync(p => p.SetProperty(x => x.Stock, x => x.Stock - quantity));
            }

            // 3. Clear the user's cart
            await _context.CartItems
                .Where(c => c.UserId == buyerId)
                .ExecuteDeleteAsync();

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return FinSucc(order);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return FinFail<Order>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Order>> GetByIdAsync(Guid id, bool includeItems = false, Guid? userId = null, string? userRole = null)
    {
        try
        {
            var query = _context.Orders.AsQueryable();

            if (includeItems)
            {
                query = query.Include(o => o.OrderItems)
                           .ThenInclude(oi => oi.Product)
                           .Include(o => o.Buyer);
            }

            if (userId.HasValue && userRole != null)
            {
                query = userRole.ToLower() switch
                {
                    "buyer" => query.Where(o => o.BuyerId == userId.Value),
                    "seller" => query.Where(o => o.OrderItems.Any(oi => oi.SellerId == userId.Value)),
                    _ => query
                };
            }

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);
            return order != null
                ? FinSucc(order)
                : FinFail<Order>(ServiceError.NotFound("Order", id.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Order>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(List<Order> Orders, int TotalCount)>> GetPagedOrdersAsync(
        Guid? userId = null, string? userRole = null, int page = 1, int pageSize = 10,
        OrderItemStatus? status = null, DateTime? fromDate = null, DateTime? toDate = null, string? searchTerm = null)
    {
        try
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .AsQueryable();

            if (userId.HasValue && userRole != null)
            {
                query = userRole.ToLower() switch
                {
                    "buyer" => query.Where(o => o.BuyerId == userId.Value),
                    "seller" => query.Where(o => o.OrderItems.Any(oi => oi.SellerId == userId.Value)),
                    _ => query
                };
            }

            if (status.HasValue)
                query = query.Where(o => o.OrderItems.Any(oi => oi.Status == status.Value));

            if (fromDate.HasValue)
                query = query.Where(o => o.CreatedAt >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(o => o.CreatedAt <= toDate.Value);

            // Add search functionality - search by product name in order items (case-insensitive)
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(o => o.OrderItems.Any(oi => 
                    oi.Product.Name.ToLower().Contains(lowerSearchTerm)));
            }

            var totalCount = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return FinSucc((orders, totalCount));
        }
        catch (Exception ex)
        {
            return FinFail<(List<Order>, int)>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<OrderItem>> GetOrderItemAsync(Guid orderItemId)
    {
        try
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                .FirstOrDefaultAsync(oi => oi.Id == orderItemId);
            return orderItem != null
                ? FinSucc(orderItem)
                : FinFail<OrderItem>(ServiceError.NotFound("OrderItem", orderItemId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<OrderItem>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<OrderItem>>> GetOrderItemsByOrderAsync(Guid orderId)
    {
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();
            return FinSucc(orderItems);
        }
        catch (Exception ex)
        {
            return FinFail<List<OrderItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<OrderItem>>> GetOrderItemsBySellerAsync(Guid orderId, Guid sellerId)
    {
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId && oi.SellerId == sellerId)
                .ToListAsync();
            return FinSucc(orderItems);
        }
        catch (Exception ex)
        {
            return FinFail<List<OrderItem>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> BulkCancelOrderItemsWithStockRestoreAsync(List<Guid> orderItemIds)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => orderItemIds.Contains(oi.Id))
                .ToListAsync();

            if (orderItems.Count != orderItemIds.Count)
                return FinFail<Unit>(ServiceError.NotFound("OrderItems", string.Join(", ", orderItemIds.Except(orderItems.Select(oi => oi.Id)))));

            // Validate all status transitions to Cancelled
            var invalidTransitions = orderItems
                .Where(oi => !oi.Status.CanTransitionTo(OrderItemStatus.Cancelled))
                .ToList();

            if (invalidTransitions.Any())
            {
                var errors = invalidTransitions
                    .Select(oi => $"OrderItem {oi.Id}: {oi.Status.GetTransitionErrorMessage(OrderItemStatus.Cancelled)}")
                    .ToList();
                return FinFail<Unit>(ServiceError.BadRequest($"Cannot cancel items: {string.Join("; ", errors)}"));
            }

            // Restore stock for each item
            foreach (var item in orderItems)
            {
                await _context.Products
                    .Where(p => p.Id == item.ProductId)
                    .ExecuteUpdateAsync(p => p.SetProperty(x => x.Stock, x => x.Stock + item.Quantity));
            }

            // Update status to Cancelled
            await _context.OrderItems
                .Where(oi => orderItemIds.Contains(oi.Id))
                .ExecuteUpdateAsync(oi => oi.SetProperty(x => x.Status, OrderItemStatus.Cancelled)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Dictionary<string, object>>> GetOrderStatsAsync(Guid? userId = null, string? userRole = null)
    {
        try
        {
            var stats = new Dictionary<string, object>();

            if (userId.HasValue && userRole != null)
            {
                switch (userRole.ToLower())
                {
                    case "buyer":
                        var buyerOrderCount = await _context.Orders.CountAsync(o => o.BuyerId == userId.Value);
                        var buyerTotalSpent = await _context.Orders
                            .Where(o => o.BuyerId == userId.Value)
                            .SumAsync(o => o.Total);
                        stats.Add("totalOrders", buyerOrderCount);
                        stats.Add("totalSpent", buyerTotalSpent);
                        break;
                    case "seller":
                        var sellerOrderCount = await _context.OrderItems.CountAsync(oi => oi.SellerId == userId.Value);
                        var sellerEarnings = await _context.OrderItems
                            .Where(oi => oi.SellerId == userId.Value)
                            .SumAsync(oi => oi.LineTotal);
                        stats.Add("totalOrderItems", sellerOrderCount);
                        stats.Add("totalEarnings", sellerEarnings);
                        break;
                }
            }
            else
            {
                var totalOrders = await _context.Orders.CountAsync();
                var totalRevenue = await _context.Orders.SumAsync(o => o.Total);
                stats.Add("totalOrders", totalOrders);
                stats.Add("totalRevenue", totalRevenue);
            }

            return FinSucc(stats);
        }
        catch (Exception ex)
        {
            return FinFail<Dictionary<string, object>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> UpdateOrderItemStatusAsync(Guid orderItemId, OrderItemStatus status)
    {
        try
        {
            // First get the current order item to validate status transition
            var orderItem = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.Id == orderItemId);

            if (orderItem == null)
                return FinFail<Unit>(ServiceError.NotFound("OrderItem", orderItemId.ToString()));

            // Validate status transition
            if (!orderItem.Status.CanTransitionTo(status))
                return FinFail<Unit>(ServiceError.BadRequest(orderItem.Status.GetTransitionErrorMessage(status)));

            var updated = await _context.OrderItems
                .Where(oi => oi.Id == orderItemId)
                .ExecuteUpdateAsync(oi => oi.SetProperty(x => x.Status, status)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));

            return updated > 0
                ? FinSucc(Unit.Default)
                : FinFail<Unit>(ServiceError.NotFound("OrderItem", orderItemId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> BulkUpdateOrderItemStatusAsync(List<Guid> orderItemIds, OrderItemStatus status)
    {
        try
        {
            // First get the current order items to validate status transitions
            var orderItems = await _context.OrderItems
                .Where(oi => orderItemIds.Contains(oi.Id))
                .ToListAsync();

            if (orderItems.Count != orderItemIds.Count)
                return FinFail<Unit>(ServiceError.NotFound("OrderItems", string.Join(", ", orderItemIds.Except(orderItems.Select(oi => oi.Id)))));

            // Validate all status transitions
            var invalidTransitions = orderItems
                .Where(oi => !oi.Status.CanTransitionTo(status))
                .ToList();

            if (invalidTransitions.Any())
            {
                var errors = invalidTransitions
                    .Select(oi => $"OrderItem {oi.Id}: {oi.Status.GetTransitionErrorMessage(status)}")
                    .ToList();
                return FinFail<Unit>(ServiceError.BadRequest($"Invalid status transitions: {string.Join("; ", errors)}"));
            }

            await _context.OrderItems
                .Where(oi => orderItemIds.Contains(oi.Id))
                .ExecuteUpdateAsync(oi => oi.SetProperty(x => x.Status, status)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow));
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> ExistsAsync(Guid orderId)
    {
        try
        {
            var exists = await _context.Orders.AnyAsync(o => o.Id == orderId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> CanCancelOrderAsync(Guid orderId)
    {
        try
        {
            var canCancel = await _context.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .AllAsync(oi => oi.Status == OrderItemStatus.Pending || oi.Status == OrderItemStatus.Processing);
            return FinSucc(canCancel);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<Order>>> SearchOrdersByOrderNumberAsync(string orderNumber)
    {
        try
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderNumber.Contains(orderNumber))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            return FinSucc(orders);
        }
        catch (Exception ex)
        {
            return FinFail<List<Order>>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(List<Order> Orders, int TotalCount)>> SearchOrdersByProductNameAsync(string productName, 
        Guid? userId = null, string? userRole = null, int page = 1, int pageSize = 10)
    {
        try
        {
            var lowerProductName = productName.ToLower();
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.OrderItems.Any(oi => oi.Product.Name.ToLower().Contains(lowerProductName)))
                .AsQueryable();

            if (userId.HasValue && userRole != null)
            {
                query = userRole.ToLower() switch
                {
                    "buyer" => query.Where(o => o.BuyerId == userId.Value),
                    "seller" => query.Where(o => o.OrderItems.Any(oi => oi.SellerId == userId.Value)),
                    _ => query
                };
            }

            var totalCount = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return FinSucc((orders, totalCount));
        }
        catch (Exception ex)
        {
            return FinFail<(List<Order>, int)>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<string>> GenerateOrderNumberAsync()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyMMddHHmm");
            var random = new Random().Next(100, 999);
            var orderNumber = $"ORD{timestamp}{random}";

            var exists = await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber);
            if (exists)
            {
                var newRandom = new Random().Next(100, 999);
                orderNumber = $"ORD{timestamp}{newRandom}";
            }

            return FinSucc(orderNumber);
        }
        catch (Exception ex)
        {
            return FinFail<string>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<List<OrderItemStatus>>> GetValidNextStatusesAsync(Guid orderItemId)
    {
        try
        {
            var orderItem = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.Id == orderItemId);

            if (orderItem == null)
                return FinFail<List<OrderItemStatus>>(ServiceError.NotFound("OrderItem", orderItemId.ToString()));

            var validStatuses = orderItem.Status.GetValidNextStatuses();
            return FinSucc(validStatuses);
        }
        catch (Exception ex)
        {
            return FinFail<List<OrderItemStatus>>(ServiceError.FromException(ex));
        }
    }
}