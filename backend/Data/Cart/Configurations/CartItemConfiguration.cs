using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.Cart.Entities;

namespace backend.Data.Cart.Configurations
{
    public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
    {
        public void Configure(EntityTypeBuilder<CartItem> builder)
        {
            builder.ToTable("CartItems");

            builder.HasKey(ci => new { ci.UserId, ci.ProductId });

            builder.Property(ci => ci.UserId)
                .ValueGeneratedNever()
                .HasComment("Foreign key to Users table - same as User.Id");

            builder.Property(ci => ci.ProductId)
                .ValueGeneratedNever()
                .HasComment("Foreign key to Products table - same as Product.Id");

            builder.Property(ci => ci.Quantity)
                .IsRequired()
                .HasDefaultValue(1)
                .HasComment("Quantity of the product in the cart item");

            // Indexes
            builder.HasIndex(ci => ci.UserId)
                .HasDatabaseName("IX_CartItems_UserId");
            builder.HasIndex(ci => ci.ProductId)
                .HasDatabaseName("IX_CartItems_ProductId");

            // Relationships
            builder.HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            builder.HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();
        }
    }
}