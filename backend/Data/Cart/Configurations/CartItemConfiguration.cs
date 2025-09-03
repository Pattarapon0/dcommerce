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

            // Use BaseEntity.Id as primary key (consistent with other entities)
            builder.HasKey(ci => ci.Id);

            builder.Property(ci => ci.UserId)
                .IsRequired()
                .HasComment("Foreign key to Users table - same as User.Id");

            builder.Property(ci => ci.ProductId)
                .IsRequired()
                .HasComment("Foreign key to Products table - same as Product.Id");

            builder.Property(ci => ci.Quantity)
                .IsRequired()
                .HasDefaultValue(1)
                .HasComment("Quantity of the product in the cart item");

            // Concurrency token
            builder.Property(ci => ci.RowVersion)
                .IsRowVersion()
                .ValueGeneratedOnAddOrUpdate()
                .IsRequired(false)
                .HasComment("Concurrency control token");

            // Unique constraint to prevent duplicate (UserId, ProductId) combinations
            builder.HasIndex(ci => new { ci.UserId, ci.ProductId })
                .IsUnique()
                .HasDatabaseName("IX_CartItems_UserId_ProductId");

            // Additional indexes for queries
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