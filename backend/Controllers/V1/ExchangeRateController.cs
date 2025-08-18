using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers.Common;
using backend.DTO.ExchangeRates;
using backend.Services.ExchangeRates;
using backend.Common.Results;

namespace backend.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/exchange-rates")]
public class ExchangeRateController(IExchangeRateService exchangeRateService) : BaseController
{
    private readonly IExchangeRateService _exchangeRateService = exchangeRateService;

    /// <summary>
    /// Get current exchange rates with THB as base currency
    /// </summary>
    /// <returns>Exchange rates for supported currencies</returns>
    [HttpGet]
    [ProducesResponseType<ServiceSuccess<ExchangeRateResponseDto>>(200)]
    [ProducesResponseType<ServiceError>(500)]
    public async Task<IActionResult> GetExchangeRates()
    {
        var result = await _exchangeRateService.GetRatesAsync();
        return HandleResult(result);
    }
}