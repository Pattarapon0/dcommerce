namespace backend.Services.Images.Internal;

public interface IRateLimitService
{
    Task<bool> IsAllowedAsync(string key, int maxRequests, TimeSpan timeWindow);
}