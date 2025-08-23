using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Common.Config;
using backend.Common.Services.Auth;
using backend.Common.Services.Email;
using backend.Common.Services.Password;
using backend.Common.Services.Token;
using backend.Data.User;
using backend.Data.Cart;
using backend.Data.Orders;
using backend.Data.Products;
using backend.Data.Sellers;
using backend.Services.User;
using backend.Services.Cart;
using backend.Services.Orders;
using backend.Services.Products;
using backend.Services.Sellers;
using backend.Validators.User;
using backend.Validators.Cart;
using backend.Validators.Orders;
using backend.Validators.Products;
using backend.Validators.Sellers;
using backend.DTO.Orders;
using backend.DTO.Products;
using backend.DTO.User;
using backend.DTO.Cart;
using backend.DTO.Sellers;
using LanguageExt;
using static LanguageExt.Prelude;
using FluentValidation;

namespace backend.Common.Config;

public static class ServiceExtensions
{
    public static IServiceCollection AddAuthSettings(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Bind auth settings
        services.Configure<AuthSettings>(configuration.GetSection("Auth"));

        // Bind cart limits
        services.Configure<CartLimits>(configuration.GetSection("CartLimits"));

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
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISellerRepository, SellerRepository>();

        // Add business services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ISellerService, SellerService>();

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

    public static IServiceCollection AddUserValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<UpdateUserProfileRequest>, UpdateUserProfileRequestValidator>();
        services.AddScoped<IValidator<CreateUserAddressRequest>, CreateUserAddressRequestValidator>();
        services.AddScoped<IValidator<UpdateUserAddressRequest>, UpdateUserAddressRequestValidator>();
        services.AddScoped<IValidator<UpdateUserPreferencesRequest>, UpdateUserPreferencesRequestValidator>();
        return services;
    }

    public static IServiceCollection AddCartValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<AddToCartRequest>, AddToCartRequestValidator>();
        services.AddScoped<IValidator<UpdateCartItemRequest>, UpdateCartItemRequestValidator>();
        return services;
    }

    public static IServiceCollection AddOrderValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateOrderRequest>, CreateOrderRequestValidator>();
        services.AddScoped<IValidator<UpdateOrderStatusRequest>, UpdateOrderStatusRequestValidator>();
        services.AddScoped<IValidator<OrderFilterRequest>, OrderFilterRequestValidator>();
        services.AddScoped<IValidator<OrderSearchRequest>, OrderSearchRequestValidator>();
        return services;
    }

    public static IServiceCollection AddSellerValidators(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateSellerProfileRequest>, CreateSellerProfileRequestValidator>();
        services.AddScoped<IValidator<UpdateSellerProfileRequest>, UpdateSellerProfileRequestValidator>();
        return services;
    }
}
