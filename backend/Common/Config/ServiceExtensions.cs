using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.Common.Config;
using server.Common.Services.Auth;
using server.Common.Services.Email;
using server.Common.Services.Password;
using server.Common.Services.Token;
using server.Data.User;
using LanguageExt;
using static LanguageExt.Prelude;
using FluentValidation;

namespace server.Common.Config;

public static class ServiceExtensions
{
    public static IServiceCollection AddAuthSettings(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Bind auth settings
        services.Configure<AuthSettings>(configuration.GetSection("Auth"));

        // Validate required settings
        var authSettings = configuration.GetSection("Auth").Get<AuthSettings>() ??
            throw new InvalidOperationException("Auth settings are not configured");

        if (string.IsNullOrEmpty(authSettings.Jwt.Key))
            throw new InvalidOperationException("JWT key is not configured");

        if (string.IsNullOrEmpty(authSettings.Jwt.Issuer))
            throw new InvalidOperationException("JWT issuer is not configured");

        if (string.IsNullOrEmpty(authSettings.Jwt.Audience))
            throw new InvalidOperationException("JWT audience is not configured");

        // Add as singleton for easy access
        services.AddSingleton(Options.Create(authSettings));

        // Add JWT Bearer Authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = authSettings.Jwt.Issuer,
                ValidAudience = authSettings.Jwt.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(authSettings.Jwt.Key)
                ),
                ClockSkew = TimeSpan.Zero
            };

            // Handle JWT events to use Option type
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    // We can now use Option pattern in controllers
                    context.Success();
                    return Task.CompletedTask;
                },
                OnAuthenticationFailed = context =>
                {
                    // We can handle errors with Either pattern in controllers
                    context.Fail(context.Exception);
                    return Task.CompletedTask;
                }
            };
        });

        // Add repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Add auth service
        services.AddScoped<IAuthService, AuthService>();

        // Add token service
        services.AddScoped<ITokenService, TokenService>();

        // Add password service with configuration from auth settings
        services.AddScoped<IPasswordService>(sp =>
        {
            var requirements = new PasswordRequirements
            {
                MinPasswordLength = authSettings.Security.MinPasswordLength,
                RequireUppercase = authSettings.Security.RequireUppercase,
                RequireDigit = authSettings.Security.RequireDigit,
                RequireSpecialCharacter = authSettings.Security.RequireSpecialCharacter
            };
            return new PasswordService(requirements);
        });

        // Add FluentValidation
        services.AddValidatorsFromAssemblyContaining<Program>();

        return services;
    }
}
