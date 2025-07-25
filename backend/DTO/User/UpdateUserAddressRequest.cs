using System.ComponentModel.DataAnnotations;

namespace backend.DTO.User;

public class UpdateUserAddressRequest
{
    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [MaxLength(20)]
    public string? PostalCode { get; set; }
}