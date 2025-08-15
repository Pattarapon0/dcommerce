using System.Collections.Concurrent;

namespace backend.Services.Images.Internal;

public class RateLimitService(ILogger<RateLimitService> logger) : IRateLimitService
{
    private readonly ConcurrentDictionary<string, (DateTime lastReset, int count)> _limits = new();
    private readonly ILogger<RateLimitService> _logger = logger;

    public Task<bool> IsAllowedAsync(string key, int maxRequests, TimeSpan timeWindow)
    {
        var now = DateTime.UtcNow;
        
        var result = _limits.AddOrUpdate(key, 
            // Add new entry
            (now, 1),
            // Update existing entry
            (existingKey, existingValue) =>
            {
                var (lastReset, count) = existingValue;
                
                // Reset counter if time window has passed
                if (now - lastReset > timeWindow)
                {
                    return (now, 1);
                }
                
                // Increment counter
                return (lastReset, count + 1);
            });

        var isAllowed = result.count <= maxRequests;        
        return Task.FromResult(isAllowed);
    }
}