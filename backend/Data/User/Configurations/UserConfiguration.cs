using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.Data.User.Entities;

namespace server.Data.User.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<Entities.User>
{
    public void Configure(EntityTypeBuilder<Entities.User> builder)
    {
        // ============================================
        // TABLE SETUP
        // ============================================
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);

        // ============================================
        // CORE IDENTITY FIELDS
        // ============================================
        
        // Primary email (required, unique)
        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255)
            .HasComment("User's primary email address - used for login and communication");

        // Optional username for social features
        builder.Property(u => u.Username)
            .HasMaxLength(50)
            .HasComment("Optional username for social features and public display");

        // ============================================
        // AUTHENTICATION & SECURITY
        // ============================================
        
        // Password (optional for OAuth users)
        builder.Property(u => u.PasswordHash)
            .HasComment("BCrypt hashed password - null for OAuth-only users");

        // Email verification
        builder.Property(u => u.IsVerified)
            .IsRequired()
            .HasDefaultValue(false)
            .HasComment("Whether user's email has been verified");

        builder.Property(u => u.EmailVerificationToken)
            .HasComment("Token for email verification - null when verified");

        // Password reset
        builder.Property(u => u.ResetToken)
            .HasComment("Token for password reset - null when not requested");

        builder.Property(u => u.ResetTokenExpiry)
            .HasComment("Expiration time for password reset token");

        // Security tracking
        builder.Property(u => u.FailedLoginAttempts)
            .IsRequired()
            .HasDefaultValue(0)
            .HasComment("Count of consecutive failed login attempts");

        builder.Property(u => u.LastLoginAttempt)
            .HasComment("Timestamp of last login attempt (successful or failed)");

        builder.Property(u => u.LastLogin)
            .HasComment("Timestamp of last successful login");

        // ============================================
        // USER PREFERENCES
        // ============================================
        
        builder.Property(u => u.PreferredLanguage)
            .HasMaxLength(10)
            .HasDefaultValue("en")
            .HasComment("User's preferred language code (ISO 639-1)");

        builder.Property(u => u.PreferredCurrency)
            .HasMaxLength(10)
            .HasDefaultValue("USD")
            .HasComment("User's preferred currency code (ISO 4217)");

        // ============================================
        // ACCOUNT STATUS & PERMISSIONS
        // ============================================
        
        // Account status
        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true)
            .HasComment("Whether user account is active - false for deactivated accounts");

        builder.Property(u => u.DeactivationReason)
            .HasMaxLength(500)
            .HasComment("Reason for account deactivation - null for active accounts");

        // User role
        builder.Property(u => u.Role)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("User")
            .HasComment("User's role in the system (User, Admin, etc.)");

        // ============================================
        // LEGAL & MARKETING
        // ============================================
        
        builder.Property(u => u.AcceptedTerms)
            .IsRequired()
            .HasDefaultValue(false)
            .HasComment("Whether user has accepted terms and conditions");

        builder.Property(u => u.TermsAcceptedAt)
            .HasComment("Timestamp when terms were accepted");

        builder.Property(u => u.NewsletterSubscription)
            .IsRequired()
            .HasDefaultValue(false)
            .HasComment("Whether user has opted into newsletter subscription");

        // ============================================
        // INDEXES FOR PERFORMANCE
        // ============================================
        
        // Unique constraints
        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email");

        builder.HasIndex(u => u.Username)
            .IsUnique()
            .HasFilter("[Username] IS NOT NULL")
            .HasDatabaseName("IX_Users_Username");

        // Search and lookup indexes
        builder.HasIndex(u => u.EmailVerificationToken)
            .HasFilter("[EmailVerificationToken] IS NOT NULL")
            .HasDatabaseName("IX_Users_EmailVerificationToken");

        builder.HasIndex(u => u.ResetToken)
            .HasFilter("[ResetToken] IS NOT NULL")
            .HasDatabaseName("IX_Users_ResetToken");

        // Common query indexes
        builder.HasIndex(u => new { u.IsActive, u.IsVerified })
            .HasDatabaseName("IX_Users_Status");

        builder.HasIndex(u => u.CreatedAt)
            .HasDatabaseName("IX_Users_CreatedAt");

        // ============================================
        // ENTITY RELATIONSHIPS
        // ============================================
        
        // One-to-one with UserProfile
        builder.HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Users_UserProfiles");

        // One-to-many with UserLogins (OAuth providers)
        builder.HasMany(u => u.Logins)
            .WithOne(l => l.User)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Users_UserLogins");

        // One-to-many with RefreshTokens
        builder.HasMany(u => u.RefreshTokens)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Users_RefreshTokens");
    }
}
