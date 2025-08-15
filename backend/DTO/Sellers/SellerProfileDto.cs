namespace backend.DTO.Sellers;

public class SellerProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessDescription { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string UserFirstName { get; set; } = string.Empty;
    public string UserLastName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}