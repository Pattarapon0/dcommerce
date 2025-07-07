using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.User.Entities;

namespace backend.Data.User.Configurations;

public class UserLoginConfiguration : IEntityTypeConfiguration<UserLogin>
{
    public void Configure(EntityTypeBuilder<UserLogin> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Provider)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(
                v => v.ToLowerInvariant(),
                v => v
            );

        builder.Property(l => l.ProviderKey)
            .IsRequired()
            .HasMaxLength(255);        builder.Property(l => l.ProviderDisplayName)
            .HasMaxLength(255);

        builder.Property(l => l.CreatedAt)
            .IsRequired()
            .HasDefaultValue(DateTime.UtcNow);

        // OAuth Token fields
        builder.Property(l => l.AccessToken)
            .HasColumnType("TEXT"); // SQLite stores as TEXT

        builder.Property(l => l.RefreshTokenOAuth)
            .HasColumnType("TEXT");

        builder.Property(l => l.Scope)
            .HasMaxLength(500); // OAuth scopes can be long

        builder.Property(l => l.TokenType)
            .HasMaxLength(20)
            .HasDefaultValue("Bearer");

        builder.Property(l => l.AutoSyncProfile)
            .HasDefaultValue(false);

        // Composite unique index for provider + key
        builder.HasIndex(l => new { l.Provider, l.ProviderKey })
            .IsUnique();

        // Index for tracking last used
        builder.HasIndex(l => l.LastUsedAt)
            .HasFilter("LastUsedAt IS NOT NULL");

        // Relationship with User
        builder.HasOne(l => l.User)
            .WithMany(u => u.Logins)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
