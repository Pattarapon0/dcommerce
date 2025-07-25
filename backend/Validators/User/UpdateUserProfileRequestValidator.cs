using FluentValidation;
using backend.DTO.User;

namespace backend.Validators.User;

public class UpdateUserProfileRequestValidator : AbstractValidator<UpdateUserProfileRequest>
{
    public UpdateUserProfileRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.FirstName))
            .WithMessage("First name cannot exceed 100 characters");

        RuleFor(x => x.LastName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.LastName))
            .WithMessage("Last name cannot exceed 100 characters");

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^[\+]?[0-9\-\(\)\s]+$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number format is invalid");

        RuleFor(x => x.DateOfBirth)
            .LessThan(DateTime.Today)
            .When(x => x.DateOfBirth.HasValue)
            .WithMessage("Date of birth must be in the past");

        RuleFor(x => x.Bio)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Bio))
            .WithMessage("Bio cannot exceed 500 characters");

        RuleFor(x => x.Website)
            .Must(BeValidUrl)
            .When(x => !string.IsNullOrEmpty(x.Website))
            .WithMessage("Website must be a valid URL");

        RuleFor(x => x.Timezone)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.Timezone))
            .WithMessage("Timezone cannot exceed 50 characters");
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out _);
    }
}