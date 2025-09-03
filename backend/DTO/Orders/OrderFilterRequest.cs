using backend.DTO.Products;
using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Orders;

public class OrderFilterRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public Data.Orders.Entities.OrderItemStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    
    [MaxLength(100)]
    public string? SearchTerm { get; set; }
}