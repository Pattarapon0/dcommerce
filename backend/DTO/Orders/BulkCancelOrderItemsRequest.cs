namespace backend.DTO.Orders;

public class BulkCancelOrderItemsRequest
{
    public List<Guid> OrderItemIds { get; set; } = new();
}