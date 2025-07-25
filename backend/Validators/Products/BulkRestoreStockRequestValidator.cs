using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public class BulkRestoreStockRequestValidator : AbstractValidator<BulkRestoreStockRequest>
{
    public BulkRestoreStockRequestValidator()
    {
        RuleFor(x => x.Items)
            .NotNull()
            .WithMessage("Items list is required")
            .NotEmpty()
            .WithMessage("At least one item is required")
            .Must(items => items.Count <= 100)
            .WithMessage("Cannot restore stock for more than 100 products at once");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId)
                .NotEmpty()
                .WithMessage("Product ID is required");

            item.RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("Quantity must be greater than 0")
                .LessThanOrEqualTo(10000)
                .WithMessage("Quantity cannot exceed 10,000");
        });
    }
}