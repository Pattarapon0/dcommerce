using backend.Data.Orders.Entities;

namespace backend.DTO.Orders;

public class BulkUpdateOrderItemStatusRequest
{
    public List<Guid> OrderItemIds { get; set; } = new();
    public OrderItemStatus Status { get; set; }
}