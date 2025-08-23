using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.User.Entities;

namespace backend.Data.User.Configurations;

public class UserAddressConfiguration : IEntityTypeConfiguration<UserAddress>
{
    public void Configure(EntityTypeBuilder<UserAddress> builder)
    {
        builder.ToTable("UserAddresses");
        builder.HasKey(a => a.UserId);

        // Ignore the inherited Id property from BaseEntity since we use UserId as PK
        builder.Ignore(a => a.Id);

        builder.Property(a => a.UserId).ValueGeneratedNever()
            .HasComment("Foreign key to Users table - same as User.Id");

        builder.Property(a => a.AddressLine1)
            .IsRequired()
            .HasMaxLength(255)
            .HasComment("Primary address line - required for all users");

        builder.Property(a => a.AddressLine2)
            .HasMaxLength(255)
            .HasComment("Secondary address line - optional");

        builder.Property(a => a.City)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("City - required for all users");

        builder.Property(a => a.State)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("State - required for all users");

        builder.Property(a => a.PostalCode)
            .IsRequired()
            .HasMaxLength(20)
            .HasComment("Postal code - required for all users");

        builder.Property(a => a.Country)
            .IsRequired()
            .HasDefaultValue("Thailand")
            .HasMaxLength(100)
            .HasComment("Country - required for all users");

        builder.Property(a => a.PhoneNumber)
            .HasMaxLength(20)
            .HasComment("Phone number - optional");


        // ============================================
        // INDEXES
        // ============================================

        builder.HasIndex(a => a.UserId)
            .HasDatabaseName("IX_UserAddresses_UserId");

        // ============================================
        // ENTITY RELATIONSHIPS
        // ============================================

        // 1 to 1 relationship with User
        builder.HasOne(a => a.User)
            .WithOne(u => u.Address)
            .HasForeignKey<UserAddress>(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_UserAddresses_Users");
    }
}
