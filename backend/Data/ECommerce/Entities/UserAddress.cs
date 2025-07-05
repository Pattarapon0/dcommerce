using server.Data.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Data.User.Entities;

namespace server.Data.ECommerce.Entities;

public class UserAddress : BaseEntity
{
    [Key]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string AddressLine1 { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? AddressLine2 { get; set; }

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string State { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PostalCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = "Thailand";

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public virtual required server.Data.User.Entities.User User { get; set; }
}