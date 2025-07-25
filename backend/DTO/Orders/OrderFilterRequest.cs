using backend.DTO.Products;

namespace backend.DTO.Orders;

public class OrderFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public Data.Orders.Entities.OrderItemStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}