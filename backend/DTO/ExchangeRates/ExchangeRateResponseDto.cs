namespace backend.DTO.ExchangeRates;

/// <summary>
/// Exchange rate response DTO for frontend consumption
/// </summary>
public class ExchangeRateResponseDto
{
    /// <summary>
    /// Exchange rates with THB as base currency (Currency -> Rate)
    /// </summary>
    public required Dictionary<string, decimal> Rates { get; set; }
    
    /// <summary>
    /// When rates were last updated
    /// </summary>
    public required DateTime LastUpdated { get; set; }
    
    /// <summary>
    /// Source of exchange rates (BOT, FALLBACK, STATIC)
    /// </summary>
    public required string Source { get; set; }
}