namespace backend.DTO.Products;

public class BulkRestoreStockRequest
{
    public List<BulkRestoreStockItem> Items { get; set; } = new();
}

public class BulkRestoreStockItem
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}