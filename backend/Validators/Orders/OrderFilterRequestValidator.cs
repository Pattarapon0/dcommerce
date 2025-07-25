using FluentValidation;
using backend.DTO.Orders;

namespace backend.Validators.Orders;

public class OrderFilterRequestValidator : AbstractValidator<OrderFilterRequest>
{
    public OrderFilterRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid order status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.FromDate)
            .LessThanOrEqualTo(x => x.ToDate).WithMessage("From date must be before or equal to To date")
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue);

        RuleFor(x => x.ToDate)
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("To date cannot be in the future")
            .When(x => x.ToDate.HasValue);
    }
}