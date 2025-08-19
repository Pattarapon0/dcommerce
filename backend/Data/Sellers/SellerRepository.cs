using Microsoft.EntityFrameworkCore;
using backend.Data.Sellers.Entities;
using backend.Data.Orders.Entities;
using backend.DTO.Sellers;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;
using System.Data;

namespace backend.Data.Sellers;

public class SellerRepository(ECommerceDbContext context) : ISellerRepository
{
    private readonly ECommerceDbContext _context = context;

    public async Task<Fin<SellerProfile>> CreateAsync(SellerProfile sellerProfile)
    {
        try
        {
            _context.SellerProfiles.Add(sellerProfile);
            await _context.SaveChangesAsync();
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> GetByIdAsync(Guid id)
    {
        try
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == id); // Changed from s.Id to s.UserId
            return seller != null
                ? FinSucc(seller)
                : FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", id.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return seller != null
                ? FinSucc(seller)
                : FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> UpdateAsync(SellerProfile sellerProfile)
    {
        try
        {
            _context.SellerProfiles.Update(sellerProfile);
            await _context.SaveChangesAsync();
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<Unit>> DeleteByUserIdAsync(Guid userId)
    {
        try
        {
            var deleted = await _context.SellerProfiles
                .Where(s => s.UserId == userId)
                .ExecuteDeleteAsync();
            return deleted > 0 
                ? FinSucc(Unit.Default)
                : FinFail<Unit>(ServiceError.NotFound("SellerProfile", userId.ToString()));
        }
        catch (Exception ex)
        {
            return FinFail<Unit>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> ExistsByUserIdAsync(Guid userId)
    {
        try
        {
            var exists = await _context.SellerProfiles.AnyAsync(s => s.UserId == userId);
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<bool>> BusinessNameExistsAsync(string businessName, Guid? excludeUserId = null)
    {
        try
        {
            var query = _context.SellerProfiles
                .Where(s => s.BusinessName.ToLower() == businessName.ToLower());

            if (excludeUserId.HasValue)
                query = query.Where(s => s.UserId != excludeUserId.Value);

            var exists = await query.AnyAsync();
            return FinSucc(exists);
        }
        catch (Exception ex)
        {
            return FinFail<bool>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> UpdateSellerProfileAsync(Guid userId, string businessName, string businessDescription)
    {
        try 
        {
            var seller = await _context.SellerProfiles
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
                
            if (seller == null)
                return FinFail<SellerProfile>(ServiceError.NotFound("SellerProfile", userId.ToString()));

            // Direct update - no pre-validation needed
            seller.BusinessName = businessName;
            seller.BusinessDescription = businessDescription;
            seller.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return FinSucc(seller);
        }
        catch (Exception ex) 
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerProfile>> CreateSellerProfileAsync(Guid userId, string businessName, string? businessDescription = null, string? avatarUrl = null)
    {
        try
        {
            // Pattern 2: Repository-level validation with fast fail
            
            // Check if user exists AND doesn't already have a seller profile
            var user = await _context.Users
                .Include(u => u.SellerProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);
                
            if (user == null)
                return FinFail<SellerProfile>(ServiceError.NotFound("User", userId.ToString()));
                
            if (user.SellerProfile != null)
                return FinFail<SellerProfile>(ServiceError.Conflict("User already has a seller profile"));

            // Check business name uniqueness
            var businessNameExists = await _context.SellerProfiles
                .AnyAsync(s => s.BusinessName.ToLower() == businessName.ToLower());
                
            if (businessNameExists)
                return FinFail<SellerProfile>(ServiceError.Conflict($"Business name '{businessName}' already exists"));

            // All validations passed - create seller profile
            var sellerProfile = new SellerProfile
            {
                UserId = userId,
                BusinessName = businessName,
                BusinessDescription = businessDescription ?? string.Empty,
                AvatarUrl = avatarUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                User = user
            };

            _context.SellerProfiles.Add(sellerProfile);
            await _context.SaveChangesAsync();
            
            return FinSucc(sellerProfile);
        }
        catch (Exception ex)
        {
            return FinFail<SellerProfile>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<SellerDashboardDto>> GetDashboardDataAsync(Guid userId)
    {
        try
        {
            string sql;
            string parameterName;
            
            // Database-specific optimized queries
            if (_context.Database.IsSqlite())
            {
                sql = GetSqliteOptimizedQuery();
                parameterName = "@UserId";
            }
            else if (_context.Database.IsNpgsql()) // PostgreSQL (Supabase)
            {
                sql = GetPostgreSqlOptimizedQuery();
                parameterName = "$1";
            }
            else if (_context.Database.ProviderName?.Contains("SqlServer") == true)
            {
                sql = GetSqlServerOptimizedQuery();
                parameterName = "@UserId";
            }
            else
            {
                // Fallback to LINQ for unsupported databases
                return await GetDashboardDataWithLinqAsync(userId);
            }

            // Execute the database-specific optimized query
            using var command = _context.Database.GetDbConnection().CreateCommand();
            command.CommandText = sql;
            
            var parameter = command.CreateParameter();
            parameter.ParameterName = parameterName;
            parameter.Value = userId;
            command.Parameters.Add(parameter);

            await _context.Database.OpenConnectionAsync();
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (!await reader.ReadAsync())
            {
                return FinSucc(CreateEmptyDashboard());
            }

            var dashboardDto = ReadDashboardFromSqlResult(reader);
            return FinSucc(dashboardDto);
        }
        catch (Exception ex)
        {
            return FinFail<SellerDashboardDto>(ServiceError.FromException(ex));
        }
    }

    public async Task<Fin<(bool UserIsSeller, bool BusinessNameExists)>> ValidateSellerCreationAsync(Guid userId, string businessName)
    {
        try
        {
            var userIsSellerTask = _context.SellerProfiles.AnyAsync(s => s.UserId == userId);
            var businessNameExistsTask = _context.SellerProfiles.AnyAsync(s => s.BusinessName.ToLower() == businessName.ToLower());

            await Task.WhenAll(userIsSellerTask, businessNameExistsTask);

            return FinSucc((userIsSellerTask.Result, businessNameExistsTask.Result));
        }
        catch (Exception ex)
        {
            return FinFail<(bool, bool)>(ServiceError.FromException(ex));
        }
    }

    #region Database-Specific Query Methods

    private string GetSqliteOptimizedQuery()
    {
        return @"
            WITH ProductStats AS (
                SELECT
                    COALESCE(COUNT(*), 0) AS TotalProducts,
                    COALESCE(SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END), 0) AS ActiveProducts,
                    COALESCE(SUM(CASE WHEN CreatedAt >= datetime('now', '-7 days') THEN 1 ELSE 0 END), 0) AS ProductsAddedThisWeek,
                    COALESCE(SUM(CASE WHEN Stock <= 10 THEN 1 ELSE 0 END), 0) AS LowStockCount
                FROM Products
                WHERE SellerId = @UserId
            ),
            OrderStats AS (
                SELECT
                    COALESCE(SUM(CASE WHEN oi.CreatedAt >= datetime('now', '-30 days') AND oi.Status = 2 THEN COALESCE(oi.LineTotal,0) ELSE 0 END), 0) AS CurrentRevenue,
                    COALESCE(SUM(CASE WHEN oi.CreatedAt >= datetime('now', '-60 days') AND oi.CreatedAt < datetime('now', '-30 days') AND oi.Status = 2 THEN COALESCE(oi.LineTotal,0) ELSE 0 END), 0) AS PreviousRevenue,
                    COALESCE(SUM(CASE WHEN oi.CreatedAt >= datetime('now', '-30 days') AND oi.Status = 2 THEN 1 ELSE 0 END), 0) AS CurrentSalesItems,
                    COALESCE(SUM(CASE WHEN oi.CreatedAt >= datetime('now', '-60 days') AND oi.CreatedAt < datetime('now', '-30 days') AND oi.Status = 2 THEN 1 ELSE 0 END), 0) AS PreviousSalesItems,
                    COALESCE(SUM(CASE WHEN oi.Status = 0 THEN 1 ELSE 0 END), 0) AS PendingOrderItems,
                    COALESCE(COUNT(DISTINCT CASE WHEN oi.Status = 0 THEN oi.OrderId END), 0) AS PendingOrdersDistinct,
                    COALESCE(CASE WHEN SUM(CASE WHEN oi.CreatedAt >= datetime('now', '-1 day') THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END, 0) AS HasNewOrders
                FROM OrderItems oi
                WHERE oi.SellerId = @UserId
                  AND (
                      oi.CreatedAt >= datetime('now', '-60 days')
                      OR oi.Status = 0
                      OR oi.CreatedAt >= datetime('now', '-1 day')
                  )
            )
            SELECT
                COALESCE(p.TotalProducts, 0) AS TotalProducts, 
                COALESCE(p.ActiveProducts, 0) AS ActiveProducts, 
                COALESCE(p.ProductsAddedThisWeek, 0) AS ProductsAddedThisWeek, 
                COALESCE(p.LowStockCount, 0) AS LowStockCount,
                COALESCE(o.CurrentRevenue, 0) AS CurrentRevenue,
                COALESCE(o.PreviousRevenue, 0) AS PreviousRevenue,
                COALESCE(o.CurrentSalesItems, 0) AS CurrentSalesItems,
                COALESCE(o.PreviousSalesItems, 0) AS PreviousSalesItems,
                COALESCE(o.PendingOrderItems, 0) AS PendingOrderItems,
                COALESCE(o.PendingOrdersDistinct, 0) AS PendingOrdersDistinct,
                COALESCE(o.HasNewOrders, 0) AS HasNewOrders
            FROM ProductStats p CROSS JOIN OrderStats o";
    }

    private string GetPostgreSqlOptimizedQuery()
    {
        return @"
            WITH ProductStats AS (
                SELECT
                    COUNT(*) AS TotalProducts,
                    SUM(CASE WHEN IsActive = true THEN 1 ELSE 0 END) AS ActiveProducts,
                    SUM(CASE WHEN CreatedAt >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS ProductsAddedThisWeek,
                    SUM(CASE WHEN Stock <= 10 THEN 1 ELSE 0 END) AS LowStockCount
                FROM Products
                WHERE SellerId = $1
            ),
            OrderStats AS (
                SELECT
                    SUM(CASE WHEN oi.CreatedAt >= NOW() - INTERVAL '30 days' AND oi.Status = 2 THEN COALESCE(oi.LineTotal,0) ELSE 0 END) AS CurrentRevenue,
                    SUM(CASE WHEN oi.CreatedAt >= NOW() - INTERVAL '60 days' AND oi.CreatedAt < NOW() - INTERVAL '30 days' AND oi.Status = 2 THEN COALESCE(oi.LineTotal,0) ELSE 0 END) AS PreviousRevenue,
                    SUM(CASE WHEN oi.CreatedAt >= NOW() - INTERVAL '30 days' AND oi.Status = 2 THEN 1 ELSE 0 END) AS CurrentSalesItems,
                    SUM(CASE WHEN oi.CreatedAt >= NOW() - INTERVAL '60 days' AND oi.CreatedAt < NOW() - INTERVAL '30 days' AND oi.Status = 2 THEN 1 ELSE 0 END) AS PreviousSalesItems,
                    SUM(CASE WHEN oi.Status = 0 THEN 1 ELSE 0 END) AS PendingOrderItems,
                    COUNT(DISTINCT CASE WHEN oi.Status = 0 THEN oi.OrderId END) AS PendingOrdersDistinct,
                    CASE WHEN SUM(CASE WHEN oi.CreatedAt >= NOW() - INTERVAL '1 day' THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS HasNewOrders
                FROM OrderItems oi
                WHERE oi.SellerId = $1
                  AND (
                      oi.CreatedAt >= NOW() - INTERVAL '60 days'
                      OR oi.Status = 0
                      OR oi.CreatedAt >= NOW() - INTERVAL '1 day'
                  )
            )
            SELECT
                p.TotalProducts, p.ActiveProducts, p.ProductsAddedThisWeek, p.LowStockCount,
                COALESCE(o.CurrentRevenue,0) AS CurrentRevenue,
                COALESCE(o.PreviousRevenue,0) AS PreviousRevenue,
                COALESCE(o.CurrentSalesItems,0) AS CurrentSalesItems,
                COALESCE(o.PreviousSalesItems,0) AS PreviousSalesItems,
                COALESCE(o.PendingOrderItems,0) AS PendingOrderItems,
                COALESCE(o.PendingOrdersDistinct,0) AS PendingOrdersDistinct,
                COALESCE(o.HasNewOrders,0) AS HasNewOrders
            FROM ProductStats p CROSS JOIN OrderStats o";
    }

    private string GetSqlServerOptimizedQuery()
    {
        return @"
            DECLARE 
                @NowUtc DATETIME2 = GETUTCDATE(),
                @ThirtyDaysAgo DATETIME2 = DATEADD(day, -30, @NowUtc),
                @SixtyDaysAgo DATETIME2  = DATEADD(day, -60, @NowUtc),
                @WeekAgo DATETIME2       = DATEADD(day, -7, @NowUtc),
                @OneDayAgo DATETIME2     = DATEADD(day, -1, @NowUtc);

            ;WITH ProductStats AS (
                SELECT
                    COUNT(*) AS TotalProducts,
                    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveProducts,
                    SUM(CASE WHEN CreatedAt >= @WeekAgo THEN 1 ELSE 0 END) AS ProductsAddedThisWeek,
                    SUM(CASE WHEN Stock <= 10 THEN 1 ELSE 0 END) AS LowStockCount
                FROM Products
                WHERE SellerId = @UserId
            ),
            OrderStats AS (
                SELECT
                    SUM(CASE WHEN oi.CreatedAt >= @ThirtyDaysAgo AND oi.Status = 2 THEN ISNULL(oi.LineTotal,0) ELSE 0 END) AS CurrentRevenue,
                    SUM(CASE WHEN oi.CreatedAt >= @SixtyDaysAgo AND oi.CreatedAt < @ThirtyDaysAgo AND oi.Status = 2 THEN ISNULL(oi.LineTotal,0) ELSE 0 END) AS PreviousRevenue,
                    SUM(CASE WHEN oi.CreatedAt >= @ThirtyDaysAgo AND oi.Status = 2 THEN 1 ELSE 0 END) AS CurrentSalesItems,
                    SUM(CASE WHEN oi.CreatedAt >= @SixtyDaysAgo AND oi.CreatedAt < @ThirtyDaysAgo AND oi.Status = 2 THEN 1 ELSE 0 END) AS PreviousSalesItems,
                    SUM(CASE WHEN oi.Status = 0 THEN 1 ELSE 0 END) AS PendingOrderItems,
                    COUNT(DISTINCT CASE WHEN oi.Status = 0 THEN oi.OrderId END) AS PendingOrdersDistinct,
                    CASE WHEN SUM(CASE WHEN oi.CreatedAt >= @OneDayAgo THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS HasNewOrders
                FROM OrderItems oi
                WHERE oi.SellerId = @UserId
                  AND (
                      oi.CreatedAt >= @SixtyDaysAgo
                      OR oi.Status = 0
                      OR oi.CreatedAt >= @OneDayAgo
                  )
            )
            SELECT
                p.TotalProducts, p.ActiveProducts, p.ProductsAddedThisWeek, p.LowStockCount,
                ISNULL(o.CurrentRevenue,0) AS CurrentRevenue,
                ISNULL(o.PreviousRevenue,0) AS PreviousRevenue,
                ISNULL(o.CurrentSalesItems,0) AS CurrentSalesItems,
                ISNULL(o.PreviousSalesItems,0) AS PreviousSalesItems,
                ISNULL(o.PendingOrderItems,0) AS PendingOrderItems,
                ISNULL(o.PendingOrdersDistinct,0) AS PendingOrdersDistinct,
                ISNULL(o.HasNewOrders,0) AS HasNewOrders
            FROM ProductStats p CROSS JOIN OrderStats o";
    }

    private SellerDashboardDto CreateEmptyDashboard()
    {
        return new SellerDashboardDto
        {
            CurrentRevenue = 0,
            RevenueChangePercent = 0,
            CurrentSales = 0,
            SalesChangePercent = 0,
            ActiveProducts = 0,
            TotalProducts = 0,
            ProductsAddedThisWeek = 0,
            LowStockCount = 0,
            PendingOrderCount = 0,
            HasNewOrders = false
        };
    }

    private SellerDashboardDto ReadDashboardFromSqlResult(IDataReader reader)
    {
        // Read results from single row - handle NULL values for new sellers
        var totalProducts = reader.IsDBNull(0) ? 0 : reader.GetInt32(0);           // TotalProducts
        var activeProducts = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);          // ActiveProducts  
        var productsAddedThisWeek = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);   // ProductsAddedThisWeek
        var lowStockCount = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);           // LowStockCount
        var currentRevenue = reader.IsDBNull(4) ? 0m : reader.GetDecimal(4);       // CurrentRevenue
        var previousRevenue = reader.IsDBNull(5) ? 0m : reader.GetDecimal(5);      // PreviousRevenue
        var currentSales = reader.IsDBNull(6) ? 0 : reader.GetInt32(6);            // CurrentSalesItems
        var previousSales = reader.IsDBNull(7) ? 0 : reader.GetInt32(7);           // PreviousSalesItems
        var pendingOrderCount = reader.IsDBNull(8) ? 0 : reader.GetInt32(8);       // PendingOrderItems
        var pendingOrdersDistinct = reader.IsDBNull(9) ? 0 : reader.GetInt32(9);   // PendingOrdersDistinct
        var hasNewOrders = reader.IsDBNull(10) ? false : reader.GetInt32(10) == 1; // HasNewOrders

        // Calculate percentage changes efficiently
        var revenueChange = previousRevenue > 0 ? 
            ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;
        var salesChange = previousSales > 0 ? 
            ((decimal)(currentSales - previousSales) / previousSales * 100) : 0;

        return new SellerDashboardDto
        {
            CurrentRevenue = currentRevenue,
            RevenueChangePercent = revenueChange,
            CurrentSales = currentSales,
            SalesChangePercent = salesChange,
            ActiveProducts = activeProducts,
            TotalProducts = totalProducts,
            ProductsAddedThisWeek = productsAddedThisWeek,
            LowStockCount = lowStockCount,
            PendingOrderCount = pendingOrderCount,
            HasNewOrders = hasNewOrders
        };
    }

    private async Task<Fin<SellerDashboardDto>> GetDashboardDataWithLinqAsync(Guid userId)
    {
        try
        {
            // Fallback LINQ implementation for unsupported databases
            var now = DateTime.UtcNow;
            var thirtyDaysAgo = now.AddDays(-30);
            var sixtyDaysAgo = now.AddDays(-60);
            var weekAgo = now.AddDays(-7);
            var oneDayAgo = now.AddDays(-1);

            // Product stats
            var productStats = await _context.Products
                .Where(p => p.SellerId == userId)
                .GroupBy(p => 1)
                .Select(g => new
                {
                    TotalProducts = g.Count(),
                    ActiveProducts = g.Count(p => p.IsActive),
                    ProductsAddedThisWeek = g.Count(p => p.CreatedAt >= weekAgo),
                    LowStockCount = g.Count(p => p.Stock <= 10)
                })
                .FirstOrDefaultAsync();

            // Order stats
            var orderStats = await _context.OrderItems
                .Where(oi => oi.SellerId == userId && 
                            (oi.CreatedAt >= sixtyDaysAgo || oi.Status == OrderItemStatus.Pending || oi.CreatedAt >= oneDayAgo))
                .GroupBy(oi => 1)
                .Select(g => new
                {
                    CurrentRevenue = g.Where(oi => oi.CreatedAt >= thirtyDaysAgo && oi.Status == OrderItemStatus.Delivered)
                                     .Sum(oi => oi.LineTotal),
                    PreviousRevenue = g.Where(oi => oi.CreatedAt >= sixtyDaysAgo && oi.CreatedAt < thirtyDaysAgo && oi.Status == OrderItemStatus.Delivered)
                                      .Sum(oi => oi.LineTotal),
                    CurrentSales = g.Count(oi => oi.CreatedAt >= thirtyDaysAgo && oi.Status == OrderItemStatus.Delivered),
                    PreviousSales = g.Count(oi => oi.CreatedAt >= sixtyDaysAgo && oi.CreatedAt < thirtyDaysAgo && oi.Status == OrderItemStatus.Delivered),
                    PendingOrderCount = g.Count(oi => oi.Status == OrderItemStatus.Pending),
                    HasNewOrders = g.Any(oi => oi.CreatedAt >= oneDayAgo)
                })
                .FirstOrDefaultAsync();

            var dashboard = new SellerDashboardDto
            {
                CurrentRevenue = orderStats?.CurrentRevenue ?? 0,
                RevenueChangePercent = orderStats?.PreviousRevenue > 0 ? 
                    ((orderStats.CurrentRevenue - orderStats.PreviousRevenue) / orderStats.PreviousRevenue * 100) : 0,
                CurrentSales = orderStats?.CurrentSales ?? 0,
                SalesChangePercent = orderStats?.PreviousSales > 0 ? 
                    ((decimal)(orderStats.CurrentSales - orderStats.PreviousSales) / orderStats.PreviousSales * 100) : 0,
                ActiveProducts = productStats?.ActiveProducts ?? 0,
                TotalProducts = productStats?.TotalProducts ?? 0,
                ProductsAddedThisWeek = productStats?.ProductsAddedThisWeek ?? 0,
                LowStockCount = productStats?.LowStockCount ?? 0,
                PendingOrderCount = orderStats?.PendingOrderCount ?? 0,
                HasNewOrders = orderStats?.HasNewOrders ?? false
            };

            return FinSucc(dashboard);
        }
        catch (Exception ex)
        {
            return FinFail<SellerDashboardDto>(ServiceError.FromException(ex));
        }
    }

    #endregion
}