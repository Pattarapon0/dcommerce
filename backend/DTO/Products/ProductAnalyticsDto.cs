namespace backend.DTO.Products;
public record ProductAnalyticsDto
{
    public int TotalProducts { get; init; }
    public int ActiveProducts { get; init; }
    public decimal TotalRevenue { get; init; }
    public int TotalSales { get; init; }

    public decimal AveragePrice { get; init; }
    public int TotalStock { get; init; }
    public double AverageStock { get; init; }
    public ProductDto? TopSellingProduct { get; init; }
}