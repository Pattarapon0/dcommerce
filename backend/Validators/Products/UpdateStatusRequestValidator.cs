using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public class UpdateStatusRequestValidator : AbstractValidator<UpdateStatusRequest>
{
    public UpdateStatusRequestValidator()
    {
        RuleFor(x => x.IsActive)
            .NotNull()
            .WithMessage("IsActive field is required");
    }
}