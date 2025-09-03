using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Orders;

public class CreateOrderFromCartRequest
{
    [Required]
    public string ShippingAddress { get; set; } = string.Empty;
}