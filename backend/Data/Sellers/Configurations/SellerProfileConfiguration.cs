using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.Data.Sellers.Entities;

namespace server.Data.Sellers.Configurations;

public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
{
    public void Configure(EntityTypeBuilder<SellerProfile> builder)
    {
        builder.ToTable("SellerProfiles");

        builder.HasKey(sp => sp.UserId);

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
