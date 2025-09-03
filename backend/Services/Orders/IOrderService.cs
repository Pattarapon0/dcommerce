using backend.DTO.Orders;
using backend.DTO.Products;
using LanguageExt;

namespace backend.Services.Orders;

public interface IOrderService
{
    // Create Operations
    Task<Fin<OrderDto>> CreateOrderAsync(CreateOrderRequest request, Guid buyerId);
    Task<Fin<OrderDto>> CreateOrderFromCartAsync(Guid buyerId, string shippingAddress);

    // Read Operations - Unified with role-based access
    Task<Fin<OrderDto>> GetOrderAsync(Guid orderId, Guid userId, string userRole);
    Task<Fin<PagedResult<OrderDto>>> GetPagedOrdersAsync(Guid userId, string userRole, OrderFilterRequest request);

    // Order Item Operations
    Task<Fin<OrderItemDto>> GetOrderItemAsync(Guid orderItemId, Guid sellerId);
    Task<Fin<List<OrderItemDto>>> GetOrderItemsBySellerAsync(Guid orderId, Guid sellerId);
    Task<Fin<OrderItemDto>> UpdateOrderItemStatusAsync(Guid orderItemId, UpdateOrderStatusRequest request, Guid sellerId);

    // Status Management
    Task<Fin<Unit>> CancelOrderAsync(Guid orderId, Guid userId, string userRole, string reason);
    Task<Fin<Unit>> CancelOrderItemAsync(Guid orderItemId, Guid sellerId, string reason);

    // Search and Analytics
    Task<Fin<List<OrderDto>>> SearchOrdersAsync(string orderNumber);
    Task<Fin<Dictionary<string, object>>> GetOrderStatsAsync(Guid? userId = null, string? userRole = null);

    // Business Logic
    Task<Fin<bool>> CanCancelOrderAsync(Guid orderId);
}