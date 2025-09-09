using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Common.Config;
using FluentValidation;
using backend.Common.Validators;
using backend.Common.Results;
using backend.Common.Services.Auth;
using backend.Common.Services.Email;
using backend.Common.Services.Password;
using backend.Common.Services.Token;
using backend.Data.User;
using backend.Validators.Products;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Text.Json.Serialization;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Amazon.S3;
using Microsoft.Extensions.Options;
using backend.Services.Images;
using backend.Services.Images.Internal;
using Microsoft.OpenApi.Models;
using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using backend.Services.Cart;
using backend.Services.Orders;
using backend.Services.Products;
using backend.Services.Sellers;
using backend.Services.User;
using backend.Data.Cart;
using backend.Data.Orders;
using backend.Data.Products;
using backend.Data.Sellers;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.AspNetCore.Authentication;

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

// Configure auth settings and validate
var authSettings = builder.Configuration.GetSection("Auth").Get<AuthSettings>();
if (authSettings?.Jwt?.Key == null)
    throw new InvalidOperationException("Auth settings are not configured properly");

builder.Services.AddSingleton(authSettings);
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("Auth"));

// Configure password requirements from auth settings or separate section
var passwordRequirements = builder.Configuration.GetSection("PasswordRequirements").Get<PasswordRequirements>()
    ?? new PasswordRequirements
    {
        MinPasswordLength = authSettings.Security?.MinPasswordLength ?? 8,
        RequireUppercase = authSettings.Security?.RequireUppercase ?? true,
        RequireDigit = authSettings.Security?.RequireDigit ?? true,
        RequireSpecialCharacter = authSettings.Security?.RequireSpecialCharacter ?? true
    };
builder.Services.AddSingleton(passwordRequirements);

// Add JWT Authentication
if (authSettings?.Jwt?.Key != null)
{
    // Disable default JWT claims mapping to use standard JWT claim names
    JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authSettings.Jwt.Key)),
                ValidateIssuer = true,
                ValidIssuer = authSettings.Jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = authSettings.Jwt.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                RoleClaimType = "role"
            };
        });

    // OAuth will be implemented with manual endpoints
    // Google OAuth configuration will be handled in the AuthController
}

// Add Authorization
builder.Services.AddAuthorization();

// Add session support for OAuth state management
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Lax; // Allow cross-site usage for OAuth
    options.Cookie.Name = ".AspNetCore.Session.OAuth";
});

// Configure image management
builder.Services.Configure<R2Options>(builder.Configuration.GetSection("R2"));
builder.Services.Configure<ImageKitOptions>(builder.Configuration.GetSection("ImageKit"));
builder.Services.Configure<ImageUploadOptions>(builder.Configuration.GetSection("ImageUpload"));

// Configure cart limits
builder.Services.Configure<CartLimits>(builder.Configuration.GetSection("CartLimits"));

// Configure exchange rate service
builder.Services.Configure<backend.Services.ExchangeRates.ExchangeRateConfig>(builder.Configuration.GetSection("ExchangeRate"));
builder.Services.AddHttpClient<backend.Services.ExchangeRates.IExchangeRateService, backend.Services.ExchangeRates.ExchangeRateService>();

// Configure S3 Client for R2
builder.Services.AddSingleton<IAmazonS3>(provider =>
{
    var r2Options = provider.GetRequiredService<IOptions<R2Options>>().Value;
    var config = new AmazonS3Config
    {
        ServiceURL = r2Options.ServiceURL, // Points to your R2 endpoint
        ForcePathStyle = false, // Changed to false for R2
        UseHttp = false // Use HTTPS
    };

    return new AmazonS3Client(r2Options.AccessKey, r2Options.SecretKey, config);
});

// HttpClient for image validation
builder.Services.AddHttpClient<IImageValidationService, ImageValidationService>();
builder.Services.AddHttpClient<IImageService, ImageService>();

// Internal image services
builder.Services.AddScoped<IR2Service, R2Service>();
builder.Services.AddScoped<IImageValidationService, ImageValidationService>();
builder.Services.AddSingleton<IRateLimitService, RateLimitService>();

// Public image service
builder.Services.AddScoped<IImageService, ImageService>();

// Email service (commented out until email setup is complete)
// builder.Services.AddScoped<IEmailService, EmailService>();

// Auth services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// OAuth services
builder.Services.AddHttpClient<backend.Common.Services.OAuth.IGoogleOAuthService, backend.Common.Services.OAuth.GoogleOAuthService>();

// Data repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ISellerRepository, SellerRepository>();

// Business services
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISellerService, SellerService>();
builder.Services.AddScoped<IUserService, UserService>();

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

// PostgreSQL with EF Core
builder.Services.AddDbContext<ECommerceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure CORS from appsettings
var corsSettings = builder.Configuration.GetSection("Cors").Get<backend.Common.Config.CorsSettings>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AppCors", policy =>
    {
        if (corsSettings?.AllowedOrigins?.Length > 0)
        {
            policy.WithOrigins(corsSettings.AllowedOrigins);
        }
        else
        {
            policy.AllowAnyOrigin();
        }

        if (corsSettings?.AllowCredentials == true)
        {
            policy.AllowCredentials();
        }

        policy.AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add response compression with detailed configuration
builder.Services.AddResponseCompression(options =>
{
    // Enable compression for HTTPS (secure by default)
    options.EnableForHttps = true;

    // Add compression providers (algorithms)
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();

    // MIME types to compress
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "application/javascript",
        "application/xml",
        "text/css",
        "text/html",
        "text/json",
        "text/plain",
        "text/xml",
        "image/svg+xml"
    });
});

// Configure Brotli compression (best compression, modern browsers)
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal; // Highest compression
});

// Configure Gzip compression (fallback for older browsers)
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal; // Highest compression
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
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "E-Commerce API Documentation";
        c.DefaultModelsExpandDepth(-1);
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseRouting();
app.UseCors("AppCors");

// Add session middleware before authentication
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Add health check endpoint for Docker/Railway
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
