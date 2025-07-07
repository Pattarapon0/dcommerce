using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.Orders.Entities;

namespace backend.Data.Orders.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            // ============================================
            // TABLE SETUP
            // ============================================
            builder.ToTable("Orders");
            builder.HasKey(o => o.Id);

            // ============================================
            // CORE FIELDS
            // ============================================
            builder.Property(o => o.OrderNumber)
                .IsRequired()
                .HasMaxLength(20)
                .HasComment("UNIQUE, Format: O-YYYYMMDD-NNN");

            builder.HasIndex(o => o.OrderNumber).IsUnique();

            builder.Property(o => o.SubTotal)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Total price of all items before tax and shipping");

            builder.Property(o => o.Tax)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Total tax applied to the order");

            builder.Property(o => o.Total)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0)
                .HasComment("Total price of the order including tax and shipping");

            builder.Property(o => o.ShippingAddressSnapshot)
                .IsRequired()
                .HasComment("JSON shipping address for the order");

            // Index 
            builder.HasIndex(o => o.BuyerId)
                .HasDatabaseName("IX_Orders_BuyerId");
            // ============================================
            // RELATIONSHIPS
            // ============================================
            builder.HasOne(o => o.Buyer)
                .WithMany(c => c.Orders)
                .HasForeignKey(o => o.BuyerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}