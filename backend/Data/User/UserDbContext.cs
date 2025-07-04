using Microsoft.EntityFrameworkCore;
using server.Data.Common;
using server.Data.User.Entities;
using server.Data.User.Configurations;

namespace server.Data.User;

public class UserDbContext : BaseDbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
    {
    }

    public DbSet<Entities.User> Users => Set<Entities.User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserLogin> UserLogins => Set<UserLogin>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new UserProfileConfiguration());
        modelBuilder.ApplyConfiguration(new UserLoginConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

        // Global query filters
        modelBuilder.Entity<Entities.User>()
            .HasQueryFilter(u => u.IsActive);

        modelBuilder.Entity<UserProfile>()
            .HasQueryFilter(p => p.User.IsActive); modelBuilder.Entity<UserLogin>()
            .HasQueryFilter(l => l.User.IsActive);

        modelBuilder.Entity<RefreshToken>()
            .HasQueryFilter(t => t.User != null && t.User.IsActive && !t.IsRevoked);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is Entities.User || e.Entity is UserProfile);

        var utcNow = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Property("CreatedAt").CurrentValue = utcNow;
                    break;

                case EntityState.Modified:
                    entry.Property("UpdatedAt").CurrentValue = utcNow;
                    break;
            }
        }
    }
}
