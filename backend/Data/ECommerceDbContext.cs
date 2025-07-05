using Microsoft.EntityFrameworkCore;
using server.Data.Common;
using server.Data.User.Entities;
using server.Data.Products.Entities;
using server.Data.Cart.Entities;
using server.Data.Orders.Entities;
using server.Data.Sellers.Entities;

// Import all configurations
using server.Data.User.Configurations;
using server.Data.Products.Configurations;
using server.Data.Cart.Configurations;
using server.Data.Orders.Configurations;
using server.Data.Sellers.Configurations;

namespace server.Data;

/// <summary>
/// Unified DbContext for the entire E-Commerce application
/// Includes User management + E-Commerce entities (Products, Orders, Cart, Sellers)
/// </summary>
public class ECommerceDbContext(DbContextOptions<ECommerceDbContext> options) : BaseDbContext(options)
{
    // User Management Entities
    public DbSet<User.Entities.User> Users => Set<User.Entities.User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserLogin> UserLogins => Set<UserLogin>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserAddress> UserAddresses => Set<UserAddress>();

    // E-Commerce Entities
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<SellerProfile> SellerProfiles => Set<SellerProfile>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations
        ApplyUserConfigurations(modelBuilder);
        ApplyECommerceConfigurations(modelBuilder);
        
        // Apply global query filters for security and data integrity
        ApplyGlobalQueryFilters(modelBuilder);
    }

    private void ApplyUserConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new UserProfileConfiguration());
        modelBuilder.ApplyConfiguration(new UserLoginConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new UserAddressConfiguration());
    }

    private void ApplyECommerceConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new CartItemConfiguration());
        modelBuilder.ApplyConfiguration(new OrderConfiguration());
        modelBuilder.ApplyConfiguration(new OrderItemConfiguration());
        modelBuilder.ApplyConfiguration(new SellerProfileConfiguration());
    }

    private void ApplyGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        // User-related filters (only active users and their data)
        modelBuilder.Entity<User.Entities.User>()
            .HasQueryFilter(u => u.IsActive);

        modelBuilder.Entity<UserProfile>()
            .HasQueryFilter(p => p.User.IsActive);
            
        modelBuilder.Entity<UserLogin>()
            .HasQueryFilter(l => l.User.IsActive);

        modelBuilder.Entity<RefreshToken>()
            .HasQueryFilter(t => t.User != null && t.User.IsActive && !t.IsRevoked);

        modelBuilder.Entity<UserAddress>()
            .HasQueryFilter(a => a.User.IsActive);

        // E-Commerce filters (active users + active products/sellers)
        modelBuilder.Entity<Product>()
            .HasQueryFilter(p => p.Seller.IsActive && p.IsActive);

        modelBuilder.Entity<CartItem>()
            .HasQueryFilter(c => c.User.IsActive && c.Product.IsActive);

        modelBuilder.Entity<Order>()
            .HasQueryFilter(o => o.Buyer.IsActive);

        modelBuilder.Entity<OrderItem>()
            .HasQueryFilter(oi => oi.Order.Buyer.IsActive);

        modelBuilder.Entity<SellerProfile>()
            .HasQueryFilter(s => s.User.IsActive);
    }
}
