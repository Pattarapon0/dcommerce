using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Common.Config;
using FluentValidation;
using backend.Common.Validators;
using backend.Common.Results;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Configure auth settings
builder.Services.AddAuthSettings(builder.Configuration);

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
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

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
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");

// Add authentication & authorization middleware here later
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
