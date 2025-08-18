using backend.DTO.ExchangeRates;
using backend.Common.Models;
using backend.Common.Results;
using Microsoft.Extensions.Options;
using System.Text.Json;
using LanguageExt;
using LanguageExt.Pretty;
using System.Globalization;

namespace backend.Services.ExchangeRates;

public class ExchangeRateService(HttpClient httpClient, IOptions<ExchangeRateConfig> config) : IExchangeRateService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ExchangeRateConfig _config = config.Value;

    private static readonly Dictionary<string, decimal> _rates = [];
    private static string _lastFetchDate = string.Empty;
    private static readonly object _lock = new();

    public async Task<Fin<ExchangeRateResponseDto>> GetRatesAsync()
    {
        var bangkokTime = DateTime.UtcNow.AddHours(7);
        var today = bangkokTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        lock (_lock)
        {
            if (_lastFetchDate == today && _rates.Count > 0)
            {
                return new ExchangeRateResponseDto
                {
                    Rates = new Dictionary<string, decimal>(_rates),
                    LastUpdated = bangkokTime,
                    Source = "CACHED"
                };
            }
        }

        // Try to fetch fresh rates
        var fetchResult = await TryFetchRatesAsync(today);

        return fetchResult.Match(
            rates =>
            {
                lock (_lock)
                {
                    _rates.Clear();
                    foreach (var rate in rates)
                        _rates[rate.Key] = rate.Value;
                    _lastFetchDate = today;
                }

                return new ExchangeRateResponseDto
                {
                    Rates = rates,
                    LastUpdated = bangkokTime,
                    Source = "BOT"
                };
            },
            error =>
            {
                // Use static fallback rates from config
                var fallbackRates = _config.StaticRates ?? [];

                return new ExchangeRateResponseDto
                {
                    Rates = fallbackRates,
                    LastUpdated = bangkokTime,
                    Source = "STATIC"
                };
            }
        );
    }

    private async Task<Fin<Dictionary<string, decimal>>> TryFetchRatesAsync(string today)
    {

        var sevenDaysAgo = DateTime.UtcNow.AddHours(7).AddDays(-7).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        // Try BOT API with 3 retries
        for (int attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                var url = $"{_config.BotApiUrl}/DAILY_AVG_EXG_RATE/?start_period={sevenDaysAgo}&end_period={today}";
                Console.WriteLine($"Fetching exchange rates from: {url}");
                using var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("X-IBM-Client-Id", _config.ClientId);

                using var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var jsonContent = await response.Content.ReadAsStringAsync();
                var botResponse = JsonSerializer.Deserialize<BotApiResponse>(jsonContent);

                if (botResponse?.result?.data?.data_detail?.Count > 0)
                {
                    var rates = ParseBotResponse(botResponse);
                    if (rates.Count > 0)
                        return rates;
                }
            }
            catch (Exception ex)
            {
                if (attempt == 3)
                    return ServiceError.Internal($"Failed to fetch exchange rates after 3 attempts: {ex.Message}");

                await Task.Delay(1000 * attempt); // Progressive delay
            }
        }

        return ServiceError.Internal("Failed to fetch exchange rates from BOT API");
    }

    private static Dictionary<string, decimal> ParseBotResponse(BotApiResponse response)
    {
        try
        {
            // Get most recent date from the response (handles weekends/holidays)
            var latestRates = response.result.data.data_detail
                .GroupBy(x => x.period)
                .OrderByDescending(g => g.Key)
                .First()
                .Where(x => !string.IsNullOrEmpty(x.mid_rate) && decimal.TryParse(x.mid_rate, out _))
                .ToDictionary(
                    x => x.currency_id.ToUpper(), // UPPERCASE currency codes
                    x => decimal.Parse(x.mid_rate)
                );

            return latestRates;
        }
        catch
        {
            return new Dictionary<string, decimal>();
        }
    }
}

public class ExchangeRateConfig
{
    public string BotApiUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public Dictionary<string, decimal>? StaticRates { get; set; }
}