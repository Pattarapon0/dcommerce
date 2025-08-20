import apiClient from './client';
import type { components } from '@/lib/types/api';

type ExchangeRateResponseDtoServiceSuccess = components['schemas']['ExchangeRateResponseDtoServiceSuccess'];
type ExchangeRateResponseDto = components['schemas']['ExchangeRateResponseDto'];

/**
 * Get current exchange rates
 * @returns Promise resolving to exchange rate data
 * @throws Will throw axios error if request fails
 */
export async function getExchangeRates(): Promise<ExchangeRateResponseDto> {
  const response = await apiClient.get('/exchange-rates');
  return response.data as ExchangeRateResponseDtoServiceSuccess['Data'] as ExchangeRateResponseDto;
}