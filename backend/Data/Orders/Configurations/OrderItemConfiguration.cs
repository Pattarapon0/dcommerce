using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.Orders.Entities;

namespace backend.Data.Orders.Configurations
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.ToTable("OrderItems");

            builder.HasKey(oi => oi.Id);

            builder.Property(oi => oi.ProductName)
                .IsRequired()
                .HasMaxLength(200)
                .HasComment("Name of the product in the order item, max length 200 characters");

            builder.Property(oi => oi.ProductImageUrl)
                .IsRequired()
                .HasMaxLength(500)
                .HasComment("URL of the product image in the order item, max length 500 characters");

            builder.Property(oi => oi.Quantity)
                .IsRequired()
                .HasDefaultValue(1)
                .HasComment("Quantity of the product in the order item, default is 1");

            builder.Property(oi => oi.PriceAtOrderTime)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Price of the product at the time of order, stored with precision 18,2");

            builder.Property(oi => oi.LineTotal)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Total price for this order item (PriceAtOrderTime * Quantity), stored with precision 18,2");

            builder.Property(oi => oi.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasDefaultValue("THB")
                .HasComment("Currency for the order item prices (ISO 4217 code)");

            builder.Property(oi => oi.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasComment("Status of the order item, stored as string");

            // Indexes for dashboard performance
            builder.HasIndex(oi => oi.OrderId)
                .HasDatabaseName("IX_OrderItems_OrderId");
            
            builder.HasIndex(oi => oi.ProductId)
                .HasDatabaseName("IX_OrderItems_ProductId");
            
            builder.HasIndex(oi => oi.SellerId)
                .HasDatabaseName("IX_OrderItems_SellerId");
                
            // Composite index for dashboard queries (SellerId + CreatedAt + Status)
            builder.HasIndex(oi => new { oi.SellerId, oi.CreatedAt, oi.Status })
                .HasDatabaseName("IX_OrderItems_Dashboard_Composite");
                
            // Index for status filtering
            builder.HasIndex(oi => oi.Status)
                .HasDatabaseName("IX_OrderItems_Status");
                
            // Composite index for dashboard queries (SellerId + CreatedAt + Status)
            builder.HasIndex(oi => new { oi.SellerId, oi.CreatedAt, oi.Status })
                .HasDatabaseName("IX_OrderItems_Dashboard_Query");
                
            // Index for status filtering
            builder.HasIndex(oi => oi.Status)
                .HasDatabaseName("IX_OrderItems_Status");
            // Relationships
            builder.HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            builder.HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
        }
    }


}