using backend.Data.Orders.Entities;

namespace backend.DTO.Orders;

public class UpdateOrderStatusRequest
{
    public OrderItemStatus Status { get; set; }
}