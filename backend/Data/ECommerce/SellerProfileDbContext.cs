using Microsoft.EntityFrameworkCore;
using server.Data.Common;
using server.Data.ECommerce.Entities;
using server.Data.ECommerce.Configurations;


namespace server.Data.ECommerce;

public class SellerProfileDbContext(DbContextOptions<SellerProfileDbContext> options) : BaseDbContext(options)
{
    public DbSet<SellerProfile> SellerProfiles => Set<SellerProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new SellerProfileConfiguration());

        modelBuilder.Entity<SellerProfile>()
            .HasQueryFilter(sp => sp.User.IsActive); // Filter out profiles for inactive users
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }
}