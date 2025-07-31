using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Common.Config;
using FluentValidation;
using backend.Common.Validators;
using backend.Common.Results;
using backend.Common.Services.Auth;
using backend.Validators.Products;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Text.Json.Serialization;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Amazon.S3;
using backend.Services.Images;
using backend.Services.Images.Internal;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "E-Commerce API", 
        Version = "v1",
        Description = "E-Commerce platform API with Buyer/Seller roles"
    });
    
    // Include XML comments (optional)
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
        
    // JWT Bearer token support
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure auth settingsbuilder.Services.AddAuthSettings(builder.Configuration);

// Configure image management
builder.Services.Configure<R2Options>(builder.Configuration.GetSection("R2"));
builder.Services.Configure<ImageKitOptions>(builder.Configuration.GetSection("ImageKit"));
builder.Services.Configure<ImageUploadOptions>(builder.Configuration.GetSection("ImageUpload"));

// Configure cart limits
builder.Services.Configure<CartLimits>(builder.Configuration.GetSection("CartLimits"));
// AWS S3 Client for R2
builder.Services.AddAWSService<IAmazonS3>();

// HttpClient for image validation
builder.Services.AddHttpClient<IImageValidationService, ImageValidationService>();

// Internal image services
builder.Services.AddScoped<IR2Service, R2Service>();
builder.Services.AddScoped<IImageValidationService, ImageValidationService>();
builder.Services.AddSingleton<IRateLimitService, RateLimitService>();

// Public image service
builder.Services.AddScoped<IImageService, ImageService>();

// Cart services

// Add controllers with JSON configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Add custom ServiceError converter first (takes precedence)
        options.JsonSerializerOptions.Converters.Add(new ServiceErrorJsonConverter());
        
        // Add general enum string converter for other enums
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep original property names
    });

// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader()
    );
})
.AddApiExplorer(setup =>
{
    setup.GroupNameFormat = "'v'VVV";
    setup.SubstituteApiVersionInUrl = true;
});

// Add FluentValidation 12.0 (Manual Validation)
builder.Services.AddAuthValidators();
builder.Services.AddUserValidators();
builder.Services.AddCartValidators();
builder.Services.AddOrderValidators();
builder.Services.AddProductValidators();
builder.Services.AddSellerValidators();

// SQLite with EF Core
builder.Services.AddDbContext<ECommerceDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=user.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "E-Commerce API v1");
        c.RoutePrefix = "swagger"; // Access at /swagger
        c.DocumentTitle = "E-Commerce API Documentation";
        
        // Optional: Custom styling
        c.DefaultModelsExpandDepth(-1); // Hide models section by default
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    });
}
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");

// Add authentication & authorization middleware here later
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
