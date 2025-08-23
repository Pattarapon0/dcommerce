namespace backend.DTO.Sellers;

public record SellerDashboardDto
{
    // Revenue analytics (30-day periods)
    public decimal CurrentRevenue { get; init; }
    public decimal RevenueChangePercent { get; init; }
    public string RevenueTrend => RevenueChangePercent >= 0 ? "up" : "down";
    public string RevenueCurrency { get; init; } = "THB";

    // Sales analytics (30-day periods)
    public int CurrentSales { get; init; }
    public decimal SalesChangePercent { get; init; }
    public string SalesTrend => SalesChangePercent >= 0 ? "up" : "down";

    // Product analytics
    public int ActiveProducts { get; init; }
    public int TotalProducts { get; init; }
    public int ProductsAddedThisWeek { get; init; }

    // Quick stats
    public int LowStockCount { get; init; } // Stock <= 10
    public int PendingOrderCount { get; init; }
    public bool HasNewOrders { get; init; } // Orders in last 24h
    public bool HasLowStock => LowStockCount > 0;
}