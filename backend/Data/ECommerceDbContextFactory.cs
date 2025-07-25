using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data;

public class ECommerceDbContextFactory : IDesignTimeDbContextFactory<ECommerceDbContext>
{
    public ECommerceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();
        
        // Use SQLite for migrations (same as runtime)
        optionsBuilder.UseSqlite("Data Source=user.db");

        return new ECommerceDbContext(optionsBuilder.Options);
    }
}