using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace server.Data.Common;

public abstract class BaseDbContext : DbContext
{
    protected BaseDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Get all entity types that inherit from BaseEntity
        var entityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType));

        foreach (var entityType in entityTypes)
        {
         
            // Configure UpdatedAt to be nullable
            var updatedAtProperty = entityType.FindProperty("UpdatedAt");
            if (updatedAtProperty != null)
            {
                updatedAtProperty.IsNullable = true;
            }
        }
    }

    protected void ConfigureSoftDelete<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ISoftDelete
    {
        modelBuilder.Entity<TEntity>()
            .HasQueryFilter(GetSoftDeleteFilter<TEntity>());
    }

    private static Expression<Func<TEntity, bool>> GetSoftDeleteFilter<TEntity>()
        where TEntity : class, ISoftDelete
    {
        Expression<Func<TEntity, bool>> filter = x => !x.IsDeleted;
        return filter;
    }
}

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}
