using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.Products.Entities;

namespace backend.Data.Products.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Products");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(200)
                .HasComment("Name of the product, max length 200 characters");

            builder.Property(p => p.Description)
                .IsRequired()
                .HasMaxLength(2000)
                .HasComment("Description of the product, max length 2000 characters");

            builder.Property(p => p.Price)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Price of the product");

            builder.Property(p => p.BaseCurrency)
                .IsRequired()
                .HasMaxLength(3)
                .HasDefaultValue("THB")
                .HasComment("Base currency for the product price (ISO 4217 code)");
            builder.Property(p => p.Category)
                .IsRequired()
                .HasConversion<string>()
                .HasComment("Category of the product, stored as string");

            builder.Property(p => p.ImageUrls)
                .IsRequired()
                .HasComment("JSON array of image URLs for the product");

            // Ignore the computed Images property - it's mapped to ImageUrls
            builder.Ignore(p => p.Images);
            builder.Property(p => p.IsActive)
                .IsRequired()
                .HasDefaultValue(true)
                .HasComment("Indicates whether the product is active");

            builder.Property(p => p.Stock)
                .IsRequired()
                .HasDefaultValue(0)
                .HasComment("Stock quantity of the product, must be greater than or equal to 0");

            builder.Property(p => p.SalesCount)
                .IsRequired()
                .HasDefaultValue(0)
                .HasComment("Number of times the product has been sold");
            // Indexes for dashboard performance
            builder.HasIndex(p => p.SellerId)
                .HasDatabaseName("IX_Products_SellerId");

            builder.HasIndex(p => new { p.SellerId, p.Name, p.Category })
                .HasDatabaseName("IX_Products_SellerId_Name_Category");

            // Dashboard-specific indexes
            builder.HasIndex(p => new { p.SellerId, p.IsActive, p.CreatedAt })
                .HasDatabaseName("IX_Products_Dashboard_Query");

            builder.HasIndex(p => new { p.SellerId, p.Stock })
                .HasDatabaseName("IX_Products_SellerId_Stock");

            // Relationships
            builder.HasOne(p => p.Seller)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SellerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.CartItems)
                .WithOne(ci => ci.Product)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.OrderItems)
                .WithOne(oi => oi.Product)
                .HasForeignKey("ProductId")
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}