using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.DTO.Orders;
using backend.DTO.Products;
using backend.Services.Orders;
using System.Security.Claims;
using backend.Common.Results;

namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/orders")]
[Authorize]
public class OrderController(IOrderService orderService) : BaseController
{
    private readonly IOrderService _orderService = orderService;

    [HttpPost]
    [ProducesResponseType<ServiceSuccess<OrderDto>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var buyerId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _orderService.CreateOrderAsync(request, buyerId));
    }

    [HttpPost("from-cart")]
    [ProducesResponseType<ServiceSuccess<OrderDto>>(201)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public Task<ObjectResult> CreateOrderFromCart([FromBody] CreateOrderFromCartRequest request)
    {
        var buyerId = GetCurrentUserId();
        return ValidateAndExecuteAsync(request, () => _orderService.CreateOrderFromCartAsync(buyerId, request.ShippingAddress));
    }

    [HttpGet("{orderId:guid}")]
    [ProducesResponseType<ServiceSuccess<OrderDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetOrder(Guid orderId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        var result = await _orderService.GetOrderAsync(orderId, userId, userRole);
        return HandleResult(result);
    }

    [HttpGet]
    [ProducesResponseType<ServiceSuccess<PagedResult<OrderDto>>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetOrders([FromQuery] OrderFilterRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.GetPagedOrdersAsync(userId, "Buyer", request);
            return result;
        });
    }

    [HttpGet("stats")]
    [ProducesResponseType<ServiceSuccess<Dictionary<string, object>>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetOrderStats()
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        var result = await _orderService.GetOrderStatsAsync(userId, userRole);
        return HandleResult(result);
    }

    [HttpGet("search")]
    [ProducesResponseType<ServiceSuccess<List<OrderDto>>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> SearchOrders([FromQuery] OrderSearchRequest request)
    {
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.SearchOrdersAsync(request.OrderNumber);
            return result;
        });
    }

    [HttpPost("{orderId:guid}/cancel")]
    [ProducesResponseType<ServiceSuccess<OrderDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> CancelOrder(Guid orderId)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        var result = await _orderService.CancelOrderAsync(orderId, userId, userRole);
        return HandleResult(result);
    }

    [HttpGet("{orderId:guid}/can-cancel")]
    [ProducesResponseType<ServiceSuccess<bool>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> CanCancelOrder(Guid orderId)
    {
        var result = await _orderService.CanCancelOrderAsync(orderId);
        return HandleResult(result);
    }

    [HttpGet("{orderId:guid}/items")]
    [ProducesResponseType<ServiceSuccess<List<OrderItemDto>>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetOrderItems(Guid orderId)
    {
        var sellerId = GetCurrentUserId();
        var result = await _orderService.GetOrderItemsBySellerAsync(orderId, sellerId);
        return HandleResult(result);
    }

    [HttpGet("items/{orderItemId:guid}")]
    [ProducesResponseType<ServiceSuccess<OrderItemDto>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetOrderItem(Guid orderItemId)
    {
        var sellerId = GetCurrentUserId();
        var result = await _orderService.GetOrderItemAsync(orderItemId, sellerId);
        return HandleResult(result);
    }

    [HttpPut("items/{orderItemId:guid}/status")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<OrderItemDto>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> UpdateOrderItemStatus(Guid orderItemId, [FromBody] UpdateOrderStatusRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.UpdateOrderItemStatusAsync(orderItemId, request, sellerId);
            return result;
        });
    }

    [HttpPost("items/{orderItemId:guid}/cancel")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> CancelOrderItem(Guid orderItemId)
    {
        var sellerId = GetCurrentUserId();
        var result = await _orderService.CancelOrderItemAsync(orderItemId, sellerId);
        return HandleResult(result);
    }

    /// <summary>
    /// Get current seller's orders containing their products
    /// </summary>
    /// <param name="request">Filter and pagination parameters</param>
    /// <returns>Paginated list of orders</returns>
    [HttpGet("my-orders")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<PagedResult<OrderDto>>>(200)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetMyOrders([FromQuery] OrderFilterRequest request)
    {
        var sellerId = GetCurrentUserId();
        var result = await _orderService.GetPagedOrdersAsync(sellerId, "Seller", request);
        return HandleResult(result);
    }

    /// <summary>
    /// Bulk update status of multiple order items by seller
    /// </summary>
    /// <param name="request">Bulk update request with item IDs and new status</param>
    /// <returns>Updated order items</returns>
    [HttpPut("items/bulk-status")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType<ServiceSuccess<List<OrderItemDto>>>(200)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> BulkUpdateOrderItemStatus([FromBody] BulkUpdateOrderItemStatusRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.BulkUpdateOrderItemStatusAsync(request, sellerId);
            return result;
        });
    }

    /// <summary>
    /// Bulk cancel multiple order items by seller
    /// </summary>
    /// <param name="request">Bulk cancel request with item IDs and reason</param>
    /// <returns>Success response</returns>
    [HttpPost("items/bulk-cancel")]
    [Authorize(Roles = "Seller")]
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> BulkCancelOrderItems([FromBody] BulkCancelOrderItemsRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.BulkCancelOrderItemsAsync(request, sellerId);
            return result;
        });
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst("role")?.Value ?? "buyer";
    }
}