namespace backend.DTO.Sellers;

public class CreateSellerProfileRequest
{
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessDescription { get; set; } = string.Empty;
}