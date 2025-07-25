using FluentValidation;
using backend.DTO.Products;
using backend.Data.Products.Entities;

namespace backend.Validators.Products;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Product description is required.")
            .MaximumLength(200).WithMessage("Product description must not exceed 200 characters.");

        RuleFor(x => x.Price)
            .NotEmpty().WithMessage("Product price is required.")
            .PrecisionScale(18, 2, false)
            .GreaterThan(0).WithMessage("Product price must be positive.");

        RuleFor(x => x.Category)
            .IsInEnum()
            .NotEmpty().WithMessage("Category is required.");

        RuleFor(x => x.Stock)
            .NotEmpty().WithMessage("Stock is required.")
            .GreaterThanOrEqualTo(0).WithMessage("Stock must be greater than or equal to 0.");

        RuleFor(x => x.Images)
            .NotEmpty().WithMessage("Product images are required.")
            .Must(images => images.Count > 0).WithMessage("At least one image is required.");
    }
}