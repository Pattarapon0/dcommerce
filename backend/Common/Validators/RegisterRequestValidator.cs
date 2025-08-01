using FluentValidation;
using backend.Common.Models;

namespace backend.Common.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        // Email validation
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email format is invalid")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters");

        // Password validation
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]+$")
            .WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&_)");

        // Required profile fields
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z\s'-]+$").WithMessage("First name contains invalid characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z\s'-]+$").WithMessage("Last name contains invalid characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country cannot exceed 100 characters");

        // Optional fields validation
        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number format is invalid")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Username)
            .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
            .Matches(@"^[a-zA-Z0-9_-]+$").WithMessage("Username can only contain letters, numbers, underscores, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.Username));

        // FIXED: Updated field name from AcceptTerms to AcceptedTerms
        RuleFor(x => x.AcceptedTerms)
            .Must(x => x == true).WithMessage("You must accept the terms and conditions");

        // Date of birth validation - Optional but must be valid age if provided
        RuleFor(x => x.DateOfBirth)
            .Must(BeAValidAge).WithMessage("You must be at least 13 years old")
            .When(x => x.DateOfBirth.HasValue);
        // Language validation
        RuleFor(x => x.PreferredLanguage)
            .MaximumLength(10).WithMessage("Preferred language code cannot exceed 10 characters")
            .When(x => !string.IsNullOrEmpty(x.PreferredLanguage));

        // Currency validation
        RuleFor(x => x.PreferredCurrency)
            .MaximumLength(10).WithMessage("Preferred currency code cannot exceed 10 characters")
            .When(x => !string.IsNullOrEmpty(x.PreferredCurrency));
    }

    private static bool BeAValidAge(DateTime? dateOfBirth)
    {
        if (!dateOfBirth.HasValue) return false;
        
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Value.Year;
        
        if (dateOfBirth.Value.Date > today.AddYears(-age))
            age--;
            
        return age >= 13;
    }
}
