using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.User.Entities;

namespace backend.Data.User.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasKey(t => t.Id); builder.Property(t => t.Token)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(t => t.ExpiresAt)
            .IsRequired();

        builder.Property(t => t.IsRevoked)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.DeviceId)
            .HasMaxLength(100);

        builder.Property(t => t.IpAddress)
            .HasMaxLength(45);

        builder.Property(t => t.ReplacedByToken)
            .HasMaxLength(255);

        builder.Property(t => t.ReasonRevoked)
            .HasMaxLength(500);

        // Ensure token uniqueness
        builder.HasIndex(t => t.Token)
            .IsUnique();        // Index for revoked tokens
        builder.HasIndex(t => t.IsRevoked)
            .HasFilter("IsRevoked = 0");

        // Composite index for user's active tokens
        builder.HasIndex(t => new { t.UserId, t.ExpiresAt, t.IsRevoked })
            .HasFilter("IsRevoked = 0");

        // Relationship with User
        builder.HasOne(t => t.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
