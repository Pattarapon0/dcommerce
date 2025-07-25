using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.User.Entities;

namespace backend.Data.User.Configurations;

public class OAuthStateConfiguration : IEntityTypeConfiguration<OAuthState>
{
    public void Configure(EntityTypeBuilder<OAuthState> builder)
    {
        // ============================================
        // TABLE SETUP
        // ============================================
        builder.ToTable("OAuthStates");
        builder.HasKey(s => s.Id);

        // ============================================
        // CORE FIELDS
        // ============================================
        
        builder.Property(s => s.State)
            .IsRequired()
            .HasMaxLength(255)
            .HasComment("CSRF protection state parameter");

        builder.Property(s => s.Nonce)
            .HasMaxLength(255)
            .HasComment("OpenID Connect nonce for replay protection");

        builder.Property(s => s.Provider)
            .IsRequired()
            .HasMaxLength(50)
            .HasComment("OAuth provider name (e.g., 'google', 'facebook')");

        builder.Property(s => s.RedirectUri)
            .HasMaxLength(500)
            .HasComment("OAuth redirect URI for this authorization flow");

        // PKCE Support
        builder.Property(s => s.CodeChallenge)
            .HasMaxLength(128)
            .HasComment("PKCE code challenge for enhanced security");

        builder.Property(s => s.CodeChallengeMethod)
            .HasMaxLength(10)
            .HasDefaultValue("S256")
            .HasComment("PKCE code challenge method (S256 recommended)");

        builder.Property(s => s.ExpiresAt)
            .IsRequired()
            .HasComment("When this OAuth state expires");

        // ============================================
        // INDEXES FOR PERFORMANCE AND SECURITY
        // ============================================
        
        // Unique index on state to prevent replay attacks
        builder.HasIndex(s => s.State)
            .IsUnique()
            .HasDatabaseName("IX_OAuthStates_State");

        // Index for cleanup of expired states
        builder.HasIndex(s => s.ExpiresAt)
            .HasDatabaseName("IX_OAuthStates_ExpiresAt");

        // Index for provider-based queries
        builder.HasIndex(s => s.Provider)
            .HasDatabaseName("IX_OAuthStates_Provider");

        // ============================================
        // RELATIONSHIPS
        // ============================================
        
        // Optional relationship with User (for logged-in users adding OAuth providers)
        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);
    }
}