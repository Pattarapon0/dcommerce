using FluentValidation;
using backend.DTO.Orders;
using backend.Data.Orders.Entities;

namespace backend.Validators.Orders;

public class UpdateOrderStatusRequestValidator : AbstractValidator<UpdateOrderStatusRequest>
{
    public UpdateOrderStatusRequestValidator()
    {
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