using FluentValidation;
using backend.Common.Models;

namespace backend.Common.Validators;

public class OAuthRegisterRequestValidator : AbstractValidator<OAuthRegisterRequest>
{
    public OAuthRegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(256)
            .WithMessage("Email cannot exceed 256 characters");

        RuleFor(x => x.Provider)
            .NotEmpty()
            .WithMessage("OAuth provider is required")
            .Must(BeValidProvider)
            .WithMessage("Invalid OAuth provider");

        RuleFor(x => x.ProviderKey)
            .NotEmpty()
            .WithMessage("Provider key is required")
            .MaximumLength(256)
            .WithMessage("Provider key cannot exceed 256 characters");

        RuleFor(x => x.AcceptedTerms)
            .Equal(true)
            .WithMessage("You must accept the terms and conditions");

        RuleFor(x => x.FirstName)
            .MaximumLength(50)
            .WithMessage("First name cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(50)
            .WithMessage("Last name cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.LastName));

        RuleFor(x => x.Username)
            .MinimumLength(3)
            .WithMessage("Username must be at least 3 characters")
            .MaximumLength(30)
            .WithMessage("Username cannot exceed 30 characters")
            .Matches(@"^[a-zA-Z0-9_-]+$")
            .WithMessage("Username can only contain letters, numbers, underscores, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.Username));
    }

    private static bool BeValidProvider(string provider)
    {
        var validProviders = new[] { "Google", "Facebook", "Twitter", "GitHub", "Microsoft" };
        return validProviders.Contains(provider, StringComparer.OrdinalIgnoreCase);
    }
}