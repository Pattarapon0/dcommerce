using FluentValidation;
using backend.DTO.Orders;

namespace backend.Validators.Orders;

public class BulkCancelOrderItemsRequestValidator : AbstractValidator<BulkCancelOrderItemsRequest>
{
    public BulkCancelOrderItemsRequestValidator()
    {
        RuleFor(x => x.OrderItemIds)
            .NotEmpty().WithMessage("At least one order item ID is required")
            .Must(x => x.Count <= 50).WithMessage("Cannot cancel more than 50 items at once")
            .Must(x => x.All(id => id != Guid.Empty)).WithMessage("All order item IDs must be valid");
    }
}