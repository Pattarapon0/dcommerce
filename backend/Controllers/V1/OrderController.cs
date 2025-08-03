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
    public async Task<IActionResult> CreateOrderFromCart()
    {
        var buyerId = GetCurrentUserId();
        var result = await _orderService.CreateOrderFromCartAsync(buyerId);
        return HandleResult(result);
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
            var result = await _orderService.GetPagedOrdersAsync(userId, userRole, request);
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
    public async Task<IActionResult> CancelOrder(Guid orderId, [FromBody] CancelOrderRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = GetCurrentUserRole();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.CancelOrderAsync(orderId, userId, userRole, request.Reason);
            return result;
        });
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
    [ProducesResponseType(204)]
    [ProducesResponseType<ServiceError>(400)]
    [ProducesResponseType<ServiceError>(401)]
    [ProducesResponseType<ServiceError>(403)]
    [ProducesResponseType<ServiceError>(404)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> CancelOrderItem(Guid orderItemId, [FromBody] CancelOrderRequest request)
    {
        var sellerId = GetCurrentUserId();
        return await ValidateAndExecuteAsync(request, async () =>
        {
            var result = await _orderService.CancelOrderItemAsync(orderItemId, sellerId, request.Reason);
            return result;
        });
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst("role")?.Value ?? "buyer";
    }

    public class CancelOrderRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}