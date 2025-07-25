using FluentValidation;
using backend.DTO.User;

namespace backend.Validators.User;

public class UpdateUserAddressRequestValidator : AbstractValidator<UpdateUserAddressRequest>
{
    public UpdateUserAddressRequestValidator()
    {
        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Address is required")
            .MaximumLength(200)
            .WithMessage("Address cannot exceed 200 characters");

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("City is required")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters");

        RuleFor(x => x.Country)
            .NotEmpty()
            .WithMessage("Country is required")
            .MaximumLength(100)
            .WithMessage("Country cannot exceed 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty()
            .WithMessage("Postal code is required")
            .MaximumLength(20)
            .WithMessage("Postal code cannot exceed 20 characters")
            .Matches(@"^[A-Za-z0-9\-\s]+$")
            .WithMessage("Postal code format is invalid");
    }
}