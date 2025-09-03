using FluentValidation;
using backend.DTO.Orders;

namespace backend.Validators.Orders;

public class CreateOrderFromCartRequestValidator : AbstractValidator<CreateOrderFromCartRequest>
{
    public CreateOrderFromCartRequestValidator()
    {
        RuleFor(x => x.ShippingAddress)
            .NotEmpty()
            .WithMessage("Shipping address is required")
            .MaximumLength(500)
            .WithMessage("Shipping address cannot exceed 500 characters");
    }
}