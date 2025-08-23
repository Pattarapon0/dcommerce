namespace backend.DTO.Cart;

public class CartSummaryDto
{
    public List<CartItemDto> Items { get; set; } = [];
    public int TotalItems { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "THB";
    public Dictionary<Guid, SellerCartGroupDto> ItemsBySeller { get; set; } = [];

    // Validation and status info
    public bool HasInvalidItems { get; set; }
    public List<string> ValidationWarnings { get; set; } = [];
    public DateTime LastUpdated { get; set; }
    public int ValidItemCount { get; set; }
    public int InvalidItemCount { get; set; }
}

public class SellerCartGroupDto
{
    public Guid SellerId { get; set; }
    public string SellerName { get; set; } = string.Empty;
    public List<CartItemDto> Items { get; set; } = [];
    public decimal SellerTotal { get; set; }
    public string Currency { get; set; } = "THB";
}