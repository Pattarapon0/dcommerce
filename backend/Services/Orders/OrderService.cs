using backend.Data.Orders;
using backend.Data.Orders.Entities;
using backend.Data.Products;
using backend.Services.Cart;
using backend.DTO.Orders;
using backend.DTO.Products;
using backend.DTO.Cart;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;
using backend.Services.Products;
using Microsoft.VisualBasic;
using System.Reflection.Metadata.Ecma335;
using LanguageExt.ClassInstances;

namespace backend.Services.Orders;

public class OrderService(
    IOrderRepository orderRepository,
    ICartService cartService,
    IProductService productService) : IOrderService
{
    private readonly IOrderRepository _orderRepository = orderRepository;
    private readonly ICartService _cartService = cartService;
    private readonly IProductService _productService = productService;

    public Task<Fin<OrderDto>> CreateOrderAsync(CreateOrderRequest request, Guid buyerId)
    {
        return FinT<IO, (string, List<ProductDto>)>.Lift(
            liftIO(async () =>
            {
                var (orderNumber, validatedItems) = await CombineTask(
                    _orderRepository.GenerateOrderNumberAsync(),
                    ValidateOrderItems(request.Items)
                );
                return orderNumber.Bind(orderNumber =>
                    validatedItems.Map(items => (orderNumber, items))
                );
            })
        ).Bind<Order>(tuple =>
            {
                var (orderNumber, validatedItems) = tuple;
                var order = CreateOrderFromItems(orderNumber, buyerId, request, validatedItems);
                var stockUpdates = CreateStockUpdatesList(validatedItems, request.Items);
                return liftIO(() => _orderRepository.CreateOrderWithStockUpdateAsync(order, stockUpdates));
            }
            ).Map(MapToOrderDto).Run().Run().AsTask();
    }

    public Task<Fin<OrderDto>> CreateOrderFromCartAsync(Guid buyerId, string shippingAddress)
    {
        return FinT<IO, (Order, List<(Guid, int)>)>.Lift(
            liftIO(async () =>
            {
                var (cartSummary, orderNumber) = await CombineTask(
                    _cartService.GetCartCheckoutSummaryAsync(buyerId),
                    _orderRepository.GenerateOrderNumberAsync()
                );
                return cartSummary.Bind(cartSummary =>
                    orderNumber.Map(orderNumber => (CreateOrderFromCartItemDtos(orderNumber, buyerId, cartSummary.Items, shippingAddress), CreateStockUpdatesFromCartItems(cartSummary.Items)))
                );
            })
        ).Bind<Order>(tuple =>
            {
                var (order, stockUpdates) = tuple;
                return liftIO(() => _orderRepository.CreateOrderFromCartWithStockUpdateAsync(order, stockUpdates, buyerId));
            }
        ).Map(MapToOrderDto).Run().Run().AsTask();
    }

    public async Task<Fin<OrderDto>> GetOrderAsync(Guid orderId, Guid userId, string userRole)
    {
        var orderResult = await _orderRepository.GetByIdAsync(orderId, includeItems: true, userId: userId, userRole: userRole);
        return orderResult.Map(MapToOrderDto);
    }

    public async Task<Fin<PagedResult<OrderDto>>> GetPagedOrdersAsync(Guid userId, string userRole, OrderFilterRequest request)
    {
        var result = await _orderRepository.GetPagedOrdersAsync(
            userId, userRole, request.Page, request.PageSize, request.Status, request.FromDate, request.ToDate, request.SearchTerm);


        return result.Map(r =>
        {
            return CreatePagedResult(r.Orders, r.TotalCount, request.Page, request.PageSize);
        });
    }

    public async Task<Fin<OrderItemDto>> GetOrderItemAsync(Guid orderItemId, Guid sellerId)
    {
        var orderItemResult = await _orderRepository.GetOrderItemAsync(orderItemId);
        return orderItemResult.Bind<OrderItemDto>(item =>
        {
            if (item.SellerId != sellerId)
                return ServiceError.Forbidden("You don't have access to this order item");

            return MapToOrderItemDto(item);
        });

    }

    public async Task<Fin<List<OrderItemDto>>> GetOrderItemsBySellerAsync(Guid orderId, Guid sellerId)
    {
        var orderItemsResult = await _orderRepository.GetOrderItemsBySellerAsync(orderId, sellerId);
        return orderItemsResult.Map(items =>
            items.Select(item => MapToOrderItemDto(item)).ToList()
        );
    }

    public Task<Fin<OrderItemDto>> UpdateOrderItemStatusAsync(Guid orderItemId, UpdateOrderStatusRequest request, Guid sellerId)
    {
        return FinT<IO, OrderItem>.Lift(
             liftIO(() => _orderRepository.GetOrderItemAsync(orderItemId))
         ).Bind<OrderItem>(orderItem =>
             orderItem.SellerId != sellerId
                ? ServiceError.Forbidden("You don't have access to this order item")
                : orderItem).Bind<OrderItemDto>(orderItem =>
                    liftIO(() => _orderRepository.UpdateOrderItemStatusAsync(orderItemId, request.Status))
                        .Map(_ => { orderItem.UpdatedAt = DateTime.UtcNow; return orderItem; }).Map(MapToOrderItemDto)
                ).Run().Run().AsTask();

    }

    public Task<Fin<Unit>> CancelOrderAsync(Guid orderId, Guid userId, string userRole, string reason)
    {
        return FinT<IO, bool>.Lift(
            liftIO(() => _orderRepository.CanCancelOrderAsync(orderId))
        ).Bind<Order>(canCancel =>
        {
            if (!canCancel)
                return ServiceError.BadRequest("Order cannot be cancelled at this stage");

            return liftIO(() => _orderRepository.GetByIdAsync(orderId, includeItems: true, userId: userId, userRole: userRole));
        }).Map<List<Guid>>(order =>
        {
            ;
            return order.OrderItems?.Select(oi => oi.Id).ToList() ?? [];
        }).Bind<Unit>(orderItemIds =>
            {
                if (orderItemIds.Count == 0)
                    return ServiceError.NotFound("OrderItems", orderId.ToString());

                return liftIO(() => _orderRepository.BulkCancelOrderItemsWithStockRestoreAsync(orderItemIds));
            }).Run().Run().AsTask();

    }

    public Task<Fin<Unit>> CancelOrderItemAsync(Guid orderItemId, Guid sellerId, string reason)
    {
        return FinT<IO, OrderItem>.Lift(
            liftIO(() => _orderRepository.GetOrderItemAsync(orderItemId))
        ).Bind<OrderItem>(orderItem =>
        {
            if (orderItem.SellerId != sellerId)
                return ServiceError.Forbidden("You don't have access to this order item");

            // Use status transition validation instead of hardcoded checks
            if (!orderItem.Status.CanTransitionTo(OrderItemStatus.Cancelled))
                return ServiceError.BadRequest(orderItem.Status.GetTransitionErrorMessage(OrderItemStatus.Cancelled));

            return orderItem;
        }).Bind<Unit>(orderItem =>
            liftIO(() => _orderRepository.BulkCancelOrderItemsWithStockRestoreAsync([orderItemId]))
        ).Run().Run().AsTask();


    }

    public async Task<Fin<List<OrderDto>>> SearchOrdersAsync(string orderNumber)
    {
        var ordersResult = await _orderRepository.SearchOrdersByOrderNumberAsync(orderNumber);
        return ordersResult.Map(orders =>
            orders.Select(MapToOrderDto).ToList()
        );
    }

    public async Task<Fin<Dictionary<string, object>>> GetOrderStatsAsync(Guid? userId = null, string? userRole = null)
    {
        return await _orderRepository.GetOrderStatsAsync(userId, userRole);
    }

    public async Task<Fin<bool>> CanCancelOrderAsync(Guid orderId)
    {
        return await _orderRepository.CanCancelOrderAsync(orderId);
    }

    private Task<Fin<List<ProductDto>>> ValidateOrderItems(IEnumerable<OrderItemRequest> items)
    {
        return Seq(items).TraverseM(item =>
            FinT<IO, ProductDto>.Lift(liftIO(() => _productService.GetProductByIdAsync(item.ProductId)))
            .MapFail(error =>
                ServiceError.BadRequest($"Product not found for ID {item.ProductId}: {error.Message}")
            ).Bind<ProductDto>(product =>
                product.Stock >= item.Quantity
                    ? product
                    : ServiceError.BadRequest($"Insufficient stock for product {product.Name}")
            )
        ).Map(seq => seq.ToList()).Run().Run().AsTask();

    }



    private Order CreateOrderFromItems(string orderNumber, Guid buyerId, CreateOrderRequest request, List<ProductDto> validatedItems)
    {
        var orderItems = validatedItems.Select(product => new OrderItem
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            SellerId = product.SellerId,
            ProductName = product.Name,
            ProductImageUrl = product.Images?.FirstOrDefault() ?? string.Empty,
            PriceAtOrderTime = product.Price,
            Quantity = request.Items.First(i => i.ProductId == product.Id).Quantity,
            LineTotal = product.Price * request.Items.First(i => i.ProductId == product.Id).Quantity,
            Currency = "THB",
            Status = OrderItemStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }).ToList();

        var subTotal = orderItems.Sum(oi => oi.LineTotal);
        var tax = subTotal * 0.1m;

        return new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            BuyerId = buyerId,
            OrderItems = orderItems,
            SubTotal = subTotal,
            Tax = tax,
            Total = subTotal + tax,
            ShippingAddressSnapshot = request.ShippingAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static Order CreateOrderFromCartItemDtos(string orderNumber, Guid buyerId, List<CartItemDto> cartItems, string shippingAddress)
    {
        var orderItems = cartItems.Select(cartItem => new OrderItem
        {
            Id = Guid.NewGuid(),
            ProductId = cartItem.ProductId,
            ProductName = cartItem.ProductName,
            ProductImageUrl = cartItem.ProductImageUrl ?? string.Empty,
            PriceAtOrderTime = cartItem.ProductPrice,
            Quantity = cartItem.Quantity,
            LineTotal = cartItem.TotalPrice,
            Currency = "THB",
            SellerId = cartItem.SellerId,
            Status = OrderItemStatus.Pending,
        }).ToList();

        var subTotal = orderItems.Sum(oi => oi.LineTotal);
        var tax = subTotal * 0.1m;

        return new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = orderNumber,
            BuyerId = buyerId,
            OrderItems = orderItems,
            SubTotal = subTotal,
            Tax = tax,
            Total = subTotal + tax,
            ShippingAddressSnapshot = shippingAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static List<(Guid ProductId, int Quantity)> CreateStockUpdatesList(List<ProductDto> validatedItems, List<OrderItemRequest> requestItems)
    {
        return [.. validatedItems.Select(item =>
            (item.Id, requestItems.First(ri => ri.ProductId == item.Id).Quantity)
        )];
    }

    private static List<(Guid ProductId, int Quantity)> CreateStockUpdatesFromCartItems(List<backend.DTO.Cart.CartItemDto> cartItems)
    {
        return [.. cartItems.Select(item => (item.ProductId, item.Quantity))];
    }

    private static OrderDto MapToOrderDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            BuyerId = order.BuyerId,
            BuyerName = (order.Buyer?.Profile?.FirstName + " " + order.Buyer?.Profile?.LastName)?.Trim() ?? string.Empty,
            SubTotal = order.SubTotal,
            Tax = order.Tax,
            Total = order.Total,
            Currency = "THB",
            ShippingAddressSnapshot = order.ShippingAddressSnapshot,
            OrderItems = order.OrderItems?.Select(MapToOrderItemDto).ToList() ?? [],
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt ?? DateTime.UtcNow,
        };
    }

    private static OrderItemDto MapToOrderItemDto(OrderItem orderItem)
    {
        return new OrderItemDto
        {
            Id = orderItem.Id,
            ProductId = orderItem.ProductId,
            SellerId = orderItem.SellerId,
            PriceAtOrderTime = orderItem.PriceAtOrderTime,
            Quantity = orderItem.Quantity,
            LineTotal = orderItem.LineTotal,
            Currency = orderItem.Currency,
            Status = orderItem.Status,
            ProductImageUrl = orderItem.ProductImageUrl,
            ProductName = orderItem.ProductName
        };
    }

    private static PagedResult<OrderDto> CreatePagedResult(List<Order> orders, int totalCount, int page, int pageSize)
    {
        var orderDtos = orders.Select(MapToOrderDto).ToList();
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        return new PagedResult<OrderDto>
        {
            Items = orderDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }

    private static async Task<(A, B)> CombineTask<A, B>(Task<A> taskA, Task<B> taskB)
    {
        await Task.WhenAll(taskA, taskB);
        return (await taskA, await taskB);
    }
}