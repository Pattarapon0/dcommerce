using backend.Data.Orders.Entities;

namespace backend.DTO.Orders;

public class CreateOrderRequest
{
    public List<OrderItemRequest> Items { get; set; } = [];
    public string ShippingAddress { get; set; } = string.Empty;
}

public class OrderItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}