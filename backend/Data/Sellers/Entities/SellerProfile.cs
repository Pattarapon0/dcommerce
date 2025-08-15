using backend.Data.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Data.User.Entities;

namespace backend.Data.Sellers.Entities;

public class SellerProfile : BaseEntity
{
    [Key]
    public Guid UserId { get; set; }

    public virtual required backend.Data.User.Entities.User User { get; set; }

    [Required]
    [MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string BusinessDescription { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

}