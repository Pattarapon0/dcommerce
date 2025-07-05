using server.Data.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Data.User.Entities;

namespace server.Data.Sellers.Entities;

public class SellerProfile : BaseEntity
{
    [Key]
    public Guid UserId { get; set; }

    public virtual required server.Data.User.Entities.User User { get; set; }

    [Required]
    [MaxLength(200)]
    public string BusinessName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string BusinessDescription { get; set; } = string.Empty;

}