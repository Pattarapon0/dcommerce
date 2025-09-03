using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data;

public class ECommerceDbContextFactory : IDesignTimeDbContextFactory<ECommerceDbContext>
{
    public ECommerceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ECommerceDbContext>();

        // Use PostgreSQL for migrations (same as runtime)
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=ecommerce_dev;Username=postgres;Password=postgres");

        return new ECommerceDbContext(optionsBuilder.Options);
    }
}