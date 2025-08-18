using Microsoft.EntityFrameworkCore;
using backend.Data.Common;
using backend.Data.User.Entities;
using backend.Data.Products.Entities;
using backend.Data.Cart.Entities;
using backend.Data.Orders.Entities;
using backend.Data.Sellers.Entities;

// Import all configurations
using backend.Data.User.Configurations;
using backend.Data.Products.Configurations;
using backend.Data.Cart.Configurations;
using backend.Data.Orders.Configurations;
using backend.Data.Sellers.Configurations;

namespace backend.Data;

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
    public DbSet<OAuthState> OAuthStates => Set<OAuthState>();
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
        modelBuilder.ApplyConfiguration(new OAuthStateConfiguration());
    }
    private void ApplyECommerceConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new CartItemConfiguration());
        modelBuilder.ApplyConfiguration(new OrderConfiguration());
        modelBuilder.ApplyConfiguration(new OrderItemConfiguration());
        modelBuilder.ApplyConfiguration(new SellerProfileConfiguration());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Handle automatic user role updates when seller profiles are created/deleted
        await HandleSellerProfileRoleUpdatesAsync();
        
        return await base.SaveChangesAsync(cancellationToken);
    }

    private async Task HandleSellerProfileRoleUpdatesAsync()
    {
        // Handle seller profile creation - record timestamp but DON'T auto-promote to Seller role
        var addedSellerProfiles = ChangeTracker.Entries<SellerProfile>()
            .Where(e => e.State == EntityState.Added)
            .Select(e => e.Entity.UserId)
            .ToList();

        foreach (var userId in addedSellerProfiles)
        {
            var userEntry = ChangeTracker.Entries<User.Entities.User>()
                .FirstOrDefault(e => e.Entity.Id == userId);

            if (userEntry != null)
            {
                var user = userEntry.Entity;
                // Only set BecameSellerAt timestamp, role assignment requires manual approval
                user.BecameSellerAt = DateTime.UtcNow;
            }
            else
            {
                // User not in change tracker, load and update
                var user = await Users.FindAsync(userId);
                if (user != null)
                {
                    // Only set BecameSellerAt timestamp, role assignment requires manual approval
                    user.BecameSellerAt = DateTime.UtcNow;
                }
            }
        }

        // Handle seller profile deletion - revert user to Buyer role and clear approval
        var deletedSellerProfiles = ChangeTracker.Entries<SellerProfile>()
            .Where(e => e.State == EntityState.Deleted)
            .Select(e => e.Entity.UserId)
            .ToList();

        foreach (var userId in deletedSellerProfiles)
        {
            var userEntry = ChangeTracker.Entries<User.Entities.User>()
                .FirstOrDefault(e => e.Entity.Id == userId);

            if (userEntry != null)
            {
                var user = userEntry.Entity;
                user.Role = "Buyer";
                user.BecameSellerAt = null;
                user.IsSellerApproved = false;
                user.SellerApprovedAt = null;
                user.SellerApprovalNotes = null;
                user.SellerRejectionReason = null;
            }
            else
            {
                // User not in change tracker, load and update
                var user = await Users.FindAsync(userId);
                if (user != null)
                {
                    user.Role = "Buyer";
                    user.BecameSellerAt = null;
                    user.IsSellerApproved = false;
                    user.SellerApprovedAt = null;
                    user.SellerApprovalNotes = null;
                    user.SellerRejectionReason = null;
                }
            }
        }
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

        // OAuth state cleanup (only non-expired states)
        modelBuilder.Entity<OAuthState>()
            .HasQueryFilter(s => s.ExpiresAt > DateTime.UtcNow);
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
