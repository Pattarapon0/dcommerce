using FluentValidation;
using backend.Common.Models;
using backend.Common.Enums;

namespace backend.Common.Validators;

public class CompleteProfileRequestValidator : AbstractValidator<CompleteProfileRequest>
{
    public CompleteProfileRequestValidator()
    {
        RuleFor(x => x.Country)
            .MaximumLength(100)
            .WithMessage("Country cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Country));

        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.DateOfBirth)
            .LessThan(DateTime.Now.AddYears(-13))
            .WithMessage("Must be at least 13 years old")
            .GreaterThan(DateTime.Now.AddYears(-120))
            .WithMessage("Invalid date of birth")
            .When(x => x.DateOfBirth.HasValue);

        RuleFor(x => x.PreferredLanguage)
            .MaximumLength(10)
            .WithMessage("Language code cannot exceed 10 characters")
            .Matches(@"^[a-z]{2}(-[A-Z]{2})?$")
            .WithMessage("Language code must be in format 'en' or 'en-US'")
            .When(x => !string.IsNullOrEmpty(x.PreferredLanguage));

        RuleFor(x => x.PreferredCurrency)
            .IsInEnum()
            .WithMessage($"Currency must be one of: {string.Join(", ", Enum.GetNames<Currency>())}")
            .When(x => x.PreferredCurrency.HasValue);
    }
}