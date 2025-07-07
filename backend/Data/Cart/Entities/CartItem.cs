using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using backend.Data.Common;
using backend.Data.Products.Entities;

namespace backend.Data.Cart.Entities;

[Index(nameof(UserId), nameof(ProductId), IsUnique = true)]
public class CartItem : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ProductId { get; set; }

    [Required]
    public int Quantity { get; set; }

    public virtual User.Entities.User User { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}