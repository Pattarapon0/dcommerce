using FluentValidation;
using server.Common.Models;

namespace server.Common.Validators;

public class VerifyEmailRequestValidator : AbstractValidator<VerifyEmailRequest>
{
    public VerifyEmailRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Verification token is required")
            .Length(32).WithMessage("Invalid verification token format")
            .Matches(@"^[a-fA-F0-9]{32}$").WithMessage("Verification token must be a valid hexadecimal string");
    }
}
