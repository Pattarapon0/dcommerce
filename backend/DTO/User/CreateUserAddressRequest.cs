using System.ComponentModel.DataAnnotations;

namespace backend.DTO.User;

public class CreateUserAddressRequest
{
    [Required]
    [MaxLength(200)]
    public required string Address { get; set; }

    [Required]
    [MaxLength(100)]
    public required string City { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Country { get; set; }

    [Required]
    [MaxLength(20)]
    public required string PostalCode { get; set; }
}