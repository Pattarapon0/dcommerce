using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public class ProductSearchQueryRequestValidator : AbstractValidator<ProductSearchQueryRequest>
{
    public ProductSearchQueryRequestValidator()
    {
        RuleFor(x => x.Term)
            .NotEmpty()
            .WithMessage("Search term is required")
            .MinimumLength(1)
            .WithMessage("Search term must be at least 1 character")
            .MaximumLength(100)
            .WithMessage("Search term cannot exceed 100 characters");

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 100)
            .WithMessage("Limit must be between 1 and 100");
    }
}