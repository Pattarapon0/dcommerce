namespace backend.Common.Config;

public class CartLimits
{
    public int MaxItemsPerCart { get; set; } = 50;
    public int MaxQuantityPerItem { get; set; } = 100;
    public decimal MaxCartValue { get; set; } = 10000.00m;
    public int MaxUniqueProductsPerCart { get; set; } = 20;
}