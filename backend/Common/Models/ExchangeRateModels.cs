namespace backend.Common.Models;

public class BotApiResponse
{
    public required BotResult result { get; set; }
}

public class BotResult
{
    public required BotData data { get; set; }
}

public class BotData
{
    public required List<BotExchangeRate> data_detail { get; set; }
}

public class BotExchangeRate
{
    public required string period { get; set; }
    public required string currency_id { get; set; }
    public required string mid_rate { get; set; }
}

public class ExchangeRateResponse
{
    public required Dictionary<string, decimal> Rates { get; set; }
    public required string LastUpdated { get; set; }
    public required string Source { get; set; }
}