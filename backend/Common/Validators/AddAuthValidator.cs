using FluentValidation;
using backend.Common.Models;

namespace backend.Common.Validators;

public static class AddAuthValidatorsExtensions
{
    public static IServiceCollection AddAuthValidators(
        this IServiceCollection services)
    {
        // Register FluentValidation validators
        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<RegisterRequest>, RegisterRequestValidator>();
        services.AddScoped<IValidator<VerifyEmailRequest>, VerifyEmailRequestValidator>();

        return services;
    }
}

