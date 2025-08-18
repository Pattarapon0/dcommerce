using backend.DTO.ExchangeRates;
using LanguageExt;

namespace backend.Services.ExchangeRates;

public interface IExchangeRateService
{
    Task<Fin<ExchangeRateResponseDto>> GetRatesAsync();
}