using FluentValidation;
using backend.DTO.Orders;
using backend.Data.Orders.Entities;

namespace backend.Validators.Orders;

public class BulkUpdateOrderItemStatusRequestValidator : AbstractValidator<BulkUpdateOrderItemStatusRequest>
{
    public BulkUpdateOrderItemStatusRequestValidator()
    {
        RuleFor(x => x.OrderItemIds)
            .NotEmpty().WithMessage("At least one order item ID is required")
            .Must(x => x.Count <= 50).WithMessage("Cannot update more than 50 items at once")
            .Must(x => x.All(id => id != Guid.Empty)).WithMessage("All order item IDs must be valid");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .IsInEnum().WithMessage("Invalid order status")
            .Must(BeAValidStatusTransition).WithMessage("Invalid status transition");
    }

    private static bool BeAValidStatusTransition(OrderItemStatus status)
    {
        // Define valid status transitions based on business rules
        var validStatuses = new[]
        {
            OrderItemStatus.Pending,
            OrderItemStatus.Processing,
            OrderItemStatus.Shipped,
            OrderItemStatus.Delivered,
            OrderItemStatus.Cancelled
        };

        return validStatuses.Contains(status);
    }
}