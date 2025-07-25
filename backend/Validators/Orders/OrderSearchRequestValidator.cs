using FluentValidation;
using backend.DTO.Orders;

namespace backend.Validators.Orders;

public class OrderSearchRequestValidator : AbstractValidator<OrderSearchRequest>
{
    public OrderSearchRequestValidator()
    {
        RuleFor(x => x.OrderNumber)
            .NotEmpty()
            .WithMessage("Order number is required")
            .MinimumLength(1)
            .WithMessage("Order number must be at least 1 character")
            .MaximumLength(50)
            .WithMessage("Order number cannot exceed 50 characters")
            .Matches(@"^[A-Za-z0-9\-_]+$")
            .WithMessage("Order number can only contain alphanumeric characters, hyphens, and underscores");
    }
}