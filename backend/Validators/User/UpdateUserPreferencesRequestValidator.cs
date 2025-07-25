using FluentValidation;
using backend.DTO.User;

namespace backend.Validators.User;

public class UpdateUserPreferencesRequestValidator : AbstractValidator<UpdateUserPreferencesRequest>
{
    public UpdateUserPreferencesRequestValidator()
    {
        RuleFor(x => x.Timezone)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.Timezone))
            .WithMessage("Timezone cannot exceed 50 characters");

        RuleFor(x => x.Language)
            .MaximumLength(10)
            .When(x => !string.IsNullOrEmpty(x.Language))
            .WithMessage("Language code cannot exceed 10 characters")
            .Matches(@"^[a-z]{2}(-[A-Z]{2})?$")
            .When(x => !string.IsNullOrEmpty(x.Language))
            .WithMessage("Language must be in format 'en' or 'en-US'");
    }
}