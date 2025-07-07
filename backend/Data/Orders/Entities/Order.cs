using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using backend.Data.Common;


namespace backend.Data.Orders.Entities;

[Index(nameof(OrderNumber), IsUnique = false)]
[Index(nameof(BuyerId), IsUnique = false)]
public class Order : BaseEntity
{
    [Required]
    [MaxLength(20)]
    public string OrderNumber { get; set; } = string.Empty;

    public Guid BuyerId { get; set; }
    [Required]
    [Precision(18, 2)]
    public decimal SubTotal { get; set; }
    [Required]
    [Precision(18, 2)]
    public decimal Total { get; set; }
    [Required]
    [Precision(18, 2)]
    public decimal Tax { get; set; }
    [Required]
    public string ShippingAddressSnapshot { get; set; } = string.Empty;

    public virtual User.Entities.User Buyer { get; set; } = null!;
    public virtual ICollection<OrderItem> OrderItems { get; set; } = [];
}