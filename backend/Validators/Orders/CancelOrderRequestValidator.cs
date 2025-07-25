using FluentValidation;
using backend.Controllers.V1;

namespace backend.Validators.Orders;

public class CancelOrderRequestValidator : AbstractValidator<OrderController.CancelOrderRequest>
{
    public CancelOrderRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("Cancellation reason is required")
            .MaximumLength(500)
            .WithMessage("Cancellation reason cannot exceed 500 characters")
            .MinimumLength(5)
            .WithMessage("Cancellation reason must be at least 5 characters");
    }
}