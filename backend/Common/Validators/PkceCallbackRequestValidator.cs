using FluentValidation;
using backend.Common.Models;

namespace backend.Common.Validators;

public class PkceCallbackRequestValidator : AbstractValidator<PkceCallbackRequest>
{
    public PkceCallbackRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Authorization code is required")
            .Length(1, 1000).WithMessage("Authorization code must be between 1 and 1000 characters");

        RuleFor(x => x.CodeVerifier)
            .NotEmpty().WithMessage("Code verifier is required")
            .Length(43, 128).WithMessage("Code verifier must be between 43 and 128 characters")
            .Matches("^[A-Za-z0-9._~-]+$").WithMessage("Code verifier contains invalid characters");

        RuleFor(x => x.State)
            .MaximumLength(500).WithMessage("State parameter cannot exceed 500 characters");
    }
}