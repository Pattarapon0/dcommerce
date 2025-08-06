using FluentValidation;
using backend.Common.Models;

namespace backend.Common.Validators;

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("Refresh token is required")
            .WithErrorCode("REFRESH_TOKEN_REQUIRED");
    }
}