using backend.Data.Orders.Entities;

namespace backend.DTO.Orders;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid BuyerId { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "THB";
    public string ShippingAddressSnapshot { get; set; } = string.Empty;
    public List<OrderItemDto> OrderItems { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }        // Reference only
    public Guid SellerId { get; set; }         // Reference only  
    public decimal PriceAtOrderTime { get; set; }  // Essential for orders
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
    public string Currency { get; set; } = "THB";
    public OrderItemStatus Status { get; set; }

    public string ProductImageUrl { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
}