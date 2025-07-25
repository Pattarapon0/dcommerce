using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Orders;

public class OrderSearchRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(50)]
    public required string OrderNumber { get; set; }
}