using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.Data.User.Entities;

namespace backend.Data.User.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        // ============================================
        // TABLE SETUP
        // ============================================
        builder.ToTable("UserProfiles");
        
        // Primary key is the UserId (one-to-one with User)
        builder.HasKey(p => p.UserId);
        
        // Ignore the inherited Id property from BaseEntity since we use UserId as PK
        builder.Ignore(p => p.Id);
        
        // Don't auto-generate UserId as it comes from User entity
        builder.Property(p => p.UserId)
            .ValueGeneratedNever()
            .HasComment("Foreign key to Users table - same as User.Id");
        // ============================================
        // BASIC PROFILE INFORMATION
        // ============================================
        
        builder.Property(p => p.FirstName)
            .HasMaxLength(100)
            .HasComment("User's first name - collected during registration");

        builder.Property(p => p.LastName)
            .HasMaxLength(100)
            .HasComment("User's last name - collected during registration");

        builder.Property(p => p.DateOfBirth)
            .HasComment("User's date of birth - used for age verification and personalization");

        // ============================================
        // CONTACT INFORMATION
        // ============================================
        
        builder.Property(p => p.PhoneNumber)
            .HasMaxLength(20)
            .HasComment("User's phone number - used for two-factor auth and contact");

        // ============================================
        // ADDRESS INFORMATION
        // ============================================
        
        builder.Property(p => p.Address)
            .HasMaxLength(200)
            .HasComment("Street address - used for shipping and billing");

        builder.Property(p => p.City)
            .HasMaxLength(100)
            .HasComment("City name - part of complete address");

        builder.Property(p => p.Country)
            .HasMaxLength(100)
            .HasComment("Country name - used for localization and compliance");

        builder.Property(p => p.PostalCode)
            .HasMaxLength(20)
            .HasComment("Postal/ZIP code - used for shipping calculations");

        // ============================================
        // EXTENDED PROFILE FEATURES
        // ============================================
        
        builder.Property(p => p.AvatarUrl)
            .HasComment("URL to user's profile picture - can be external or internal storage");

        builder.Property(p => p.Bio)
            .HasComment("User's biography or description - used in social features");

        builder.Property(p => p.Website)
            .HasMaxLength(100)
            .HasComment("User's personal or business website URL");

        builder.Property(p => p.Timezone)
            .HasMaxLength(50)
            .HasDefaultValue("UTC")
            .HasComment("User's timezone - used for scheduling and time display");

        // Social media links stored as JSON
        builder.Property(p => p.SocialLinks)
            .HasColumnType("TEXT")
            .HasComment("JSON string containing social media links and handles");

        // ============================================
        // INDEXES FOR PERFORMANCE
        // ============================================
        
        // Index for phone number lookups (when provided)
        builder.HasIndex(p => p.PhoneNumber)
            .HasFilter("[PhoneNumber] IS NOT NULL")
            .HasDatabaseName("IX_UserProfiles_PhoneNumber");

        // Index for location-based queries
        builder.HasIndex(p => new { p.Country, p.City })
            .HasFilter("[Country] IS NOT NULL AND [City] IS NOT NULL")
            .HasDatabaseName("IX_UserProfiles_Location");

        // Index for name searches
        builder.HasIndex(p => new { p.FirstName, p.LastName })
            .HasFilter("[FirstName] IS NOT NULL AND [LastName] IS NOT NULL")
            .HasDatabaseName("IX_UserProfiles_FullName");

        // Index for birthday queries (optional feature)
        builder.HasIndex(p => p.DateOfBirth)
            .HasFilter("[DateOfBirth] IS NOT NULL")
            .HasDatabaseName("IX_UserProfiles_DateOfBirth");

        // ============================================
        // ENTITY RELATIONSHIPS
        // ============================================
        
        // One-to-one relationship with User
        builder.HasOne(p => p.User)
            .WithOne(u => u.Profile)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_UserProfiles_Users");
    }
}
