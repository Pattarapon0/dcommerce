using FluentValidation;
using backend.DTO.Products;
using backend.Data.Products.Entities;

namespace backend.Validators.Products;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Product description must not exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Price)
            .PrecisionScale(18, 2, false)
            .GreaterThan(0).WithMessage("Product price must be positive.")
            .When(x => x.Price.HasValue);

        RuleFor(x => x.Category)
            .IsInEnum()
            .When(x => x.Category.HasValue);

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Stock must be greater than or equal to 0.")
            .When(x => x.Stock.HasValue);

        RuleFor(x => x.Images)
            .Must(images => images!.Count > 0).WithMessage("At least one image is required.")
            .When(x => x.Images != null);
    }
}