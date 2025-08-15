using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.Sellers.Entities;

namespace backend.Data.Sellers.Configurations;

public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
{
    public void Configure(EntityTypeBuilder<SellerProfile> builder)
    {
        builder.ToTable("SellerProfiles");

        builder.HasKey(sp => sp.UserId);

        // Ignore the inherited Id property from BaseEntity since we use UserId as PK
        builder.Ignore(sp => sp.Id);

        builder.Property(sp => sp.UserId)
            .ValueGeneratedNever()
            .HasComment("Foreign key to Users table - same as User.Id");
        builder.Property(sp => sp.BusinessName)
            .IsRequired()
            .HasMaxLength(200)
            .HasComment("Name of the seller's business");

        builder.Property(sp => sp.BusinessDescription)
            .HasMaxLength(1000)
            .HasComment("Optional description of the seller's business");

        builder.Property(sp => sp.AvatarUrl)
            .HasComment("URL for the seller's business profile picture");

        // indexes
        builder.HasIndex(sp => sp.UserId)
            .HasDatabaseName("IX_SellerProfiles_UserId");

        // relationships
        builder.HasOne(sp => sp.User)
            .WithOne(u => u.SellerProfile)
            .HasForeignKey<SellerProfile>(sp => sp.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();
    }
}
