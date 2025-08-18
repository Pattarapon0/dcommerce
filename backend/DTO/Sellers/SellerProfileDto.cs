namespace backend.DTO.Sellers;

public class SellerProfileDto
{
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessDescription { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsApproved { get; set; }
}