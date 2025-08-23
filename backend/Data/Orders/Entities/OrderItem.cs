using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using backend.Data.Common;

namespace backend.Data.Orders.Entities;


[Index(nameof(OrderId), IsUnique = false)]
[Index(nameof(ProductId), IsUnique = false)]
[Index(nameof(SellerId), IsUnique = false)]
public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid SellerId { get; set; }

    [Required]
    public string ProductName { get; set; } = string.Empty;
    [Required]
    public string ProductImageUrl { get; set; } = string.Empty;
    [Required]
    [Precision(18, 2)]
    public decimal PriceAtOrderTime { get; set; }
    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a positive integer.")]
    public int Quantity { get; set; }
    [Required]
    [Precision(18, 2)]
    public decimal LineTotal { get; set; }
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "THB";

    public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;
    public virtual Order Order { get; set; } = null!;
    public virtual Products.Entities.Product Product { get; set; } = null!;
}

public enum OrderItemStatus
{
    Pending,      // Order placed, awaiting seller confirmation
    Processing,   // Seller confirmed, preparing item
    Shipped,      // Item shipped by seller
    Delivered,    // Item delivered to customer
    Cancelled     // Item cancelled (by seller or system)
}

public static class OrderItemStatusExtensions
{
    private static readonly Dictionary<OrderItemStatus, List<OrderItemStatus>> ValidTransitions = new()
    {
        [OrderItemStatus.Pending] = [OrderItemStatus.Processing, OrderItemStatus.Cancelled],
        [OrderItemStatus.Processing] = [OrderItemStatus.Shipped, OrderItemStatus.Cancelled],
        [OrderItemStatus.Shipped] = [OrderItemStatus.Delivered],
        [OrderItemStatus.Delivered] = [], // Terminal state
        [OrderItemStatus.Cancelled] = []  // Terminal state
    };

    public static bool CanTransitionTo(this OrderItemStatus current, OrderItemStatus target)
    {
        return ValidTransitions.TryGetValue(current, out var allowedTransitions) &&
               allowedTransitions.Contains(target);
    }

    public static List<OrderItemStatus> GetValidNextStatuses(this OrderItemStatus current)
    {
        return ValidTransitions.TryGetValue(current, out var transitions) ? transitions : [];
    }

    public static string GetTransitionErrorMessage(this OrderItemStatus current, OrderItemStatus target)
    {
        if (current == target)
            return $"Order item is already in {current} status";

        var validNext = current.GetValidNextStatuses();
        if (validNext.Count == 0)
            return $"Order item in {current} status cannot be changed (terminal state)";

        return $"Cannot transition from {current} to {target}. Valid transitions: {string.Join(", ", validNext)}";
    }
}