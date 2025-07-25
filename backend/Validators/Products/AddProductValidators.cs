

using FluentValidation;
using backend.DTO.Products;

namespace backend.Validators.Products;

public static class AddProductValidatorsExtensions
{
    public static IServiceCollection AddProductValidators(
        this IServiceCollection services)
    {
        // Register FluentValidation validators
        services.AddScoped<IValidator<CreateProductRequest>, CreateProductRequestValidator>();
        services.AddScoped<IValidator<UpdateProductRequest>, UpdateProductRequestValidator>();
        services.AddScoped<IValidator<ProductSearchRequest>, ProductSearchRequestValidator>();
        services.AddScoped<IValidator<UpdateStockRequest>, UpdateStockRequestValidator>();
        services.AddScoped<IValidator<UpdateStatusRequest>, UpdateStatusRequestValidator>();

        return services;
    }
}