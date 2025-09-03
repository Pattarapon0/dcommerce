using backend.Data.Orders.Entities;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Data.Orders;

public interface IOrderRepository
{
    // Core CRUD Operations
    Task<Fin<Order>> CreateAsync(Order order);
    Task<Fin<Order>> CreateOrderWithStockUpdateAsync(Order order, List<(Guid ProductId, int Quantity)> stockUpdates);
    Task<Fin<Order>> CreateOrderFromCartWithStockUpdateAsync(Order order, List<(Guid ProductId, int Quantity)> stockUpdates, Guid buyerId);
    Task<Fin<Order>> GetByIdAsync(Guid id, bool includeItems = false, Guid? userId = null, string? userRole = null);
    Task<Fin<(List<Order> Orders, int TotalCount)>> GetPagedOrdersAsync(
        Guid? userId = null, string? userRole = null, int page = 1, int pageSize = 10,
        OrderItemStatus? status = null, DateTime? fromDate = null, DateTime? toDate = null, string? searchTerm = null);

    // Order Items Operations
    Task<Fin<OrderItem>> GetOrderItemAsync(Guid orderItemId);
    Task<Fin<List<OrderItem>>> GetOrderItemsByOrderAsync(Guid orderId);
    Task<Fin<List<OrderItem>>> GetOrderItemsBySellerAsync(Guid orderId, Guid sellerId);

    // Status Management
    Task<Fin<Unit>> UpdateOrderItemStatusAsync(Guid orderItemId, OrderItemStatus status);
    Task<Fin<Unit>> BulkUpdateOrderItemStatusAsync(List<Guid> orderItemIds, OrderItemStatus status);
    Task<Fin<Unit>> BulkCancelOrderItemsWithStockRestoreAsync(List<Guid> orderItemIds);
    Task<Fin<List<OrderItemStatus>>> GetValidNextStatusesAsync(Guid orderItemId);

    // Validation and Business Logic
    Task<Fin<bool>> ExistsAsync(Guid orderId);
    Task<Fin<bool>> CanCancelOrderAsync(Guid orderId);

    // Search and Analytics
    Task<Fin<List<Order>>> SearchOrdersByOrderNumberAsync(string orderNumber);
    Task<Fin<(List<Order> Orders, int TotalCount)>> SearchOrdersByProductNameAsync(string productName, 
        Guid? userId = null, string? userRole = null, int page = 1, int pageSize = 10);
    Task<Fin<Dictionary<string, object>>> GetOrderStatsAsync(Guid? userId = null, string? userRole = null);

    // Order Generation
    Task<Fin<string>> GenerateOrderNumberAsync();
}