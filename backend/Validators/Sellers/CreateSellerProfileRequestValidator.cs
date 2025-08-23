using FluentValidation;
using backend.DTO.Sellers;

namespace backend.Validators.Sellers;

public class CreateSellerProfileRequestValidator : AbstractValidator<CreateSellerProfileRequest>
{
    public CreateSellerProfileRequestValidator()
    {
        RuleFor(x => x.BusinessName)
            .NotEmpty().WithMessage("Business name is required")
            .MaximumLength(200).WithMessage("Business name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Business name must be at least 2 characters")
            .Matches(@"^[a-zA-Z0-9\s\-&.,'()]+$").WithMessage("Business name contains invalid characters");

        RuleFor(x => x.BusinessDescription)
            .MaximumLength(1000).WithMessage("Business description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.BusinessDescription));

        RuleFor(x => x.AvatarUrl)
            .Must(url => Uri.IsWellFormedUriString(url, UriKind.Absolute)).WithMessage("Avatar URL must be a valid absolute URL")
            .Matches(@"^https?://").WithMessage("Avatar URL must start with http:// or https://")
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl));
    }
}
