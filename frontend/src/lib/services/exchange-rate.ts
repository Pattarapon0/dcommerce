interface ExchangeRates {
  [currency: string]: number;
}

interface CacheEntry {
  rates: ExchangeRates;
  timestamp: number;
  ttl: number;
}

class ExchangeRateService {
  private cache: CacheEntry | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/thb.json';
  private readonly FALLBACK_API = 'https://open.er-api.com/v6/latest/THB';
  
  private readonly FALLBACK_RATES: ExchangeRates = {
    usd: 0.028,
    eur: 0.026,
    gbp: 0.022,
    jpy: 4.2,
    cny: 0.20,
    krw: 38.5,
    sgd: 0.038,
    aud: 0.043,
    cad: 0.038,
    thb: 1.0
  };

  async getRates(): Promise<ExchangeRates> {
    if (this.isCacheValid()) {
      return this.cache!.rates;
    }

    try {
      const rates = await this.fetchRates();
      this.updateCache(rates);
      return rates;
    } catch (error) {
      console.warn('Failed to fetch exchange rates, using fallback:', error);
      
      if (this.cache) {
        console.log('Using expired cache data');
        return this.cache.rates;
      }
      
      console.log('Using static fallback rates');
      this.updateCache(this.FALLBACK_RATES);
      return this.FALLBACK_RATES;
    }
  }

  async getRate(toCurrency: string): Promise<number> {
    const rates = await this.getRates();
    const currency = toCurrency.toLowerCase();
    return rates[currency] || 1; // Default to 1 if currency not found
  }

  async convertFromTHB(thbAmount: number, toCurrency: string): Promise<number> {
    if (toCurrency.toLowerCase() === 'thb') return thbAmount;
    
    const rate = await this.getRate(toCurrency);
    return thbAmount * rate;
  }

  async convertToTHB(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency.toLowerCase() === 'thb') return amount;
    
    const rate = await this.getRate(fromCurrency);
    return rate > 0 ? amount / rate : amount;
  }

  private async fetchRates(): Promise<ExchangeRates> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.thb || data;
    } catch (error) {
      console.warn('Primary API failed, trying fallback:', error);
      return await this.fetchFallbackRates();
    }
  }

  private async fetchFallbackRates(): Promise<ExchangeRates> {
    const response = await fetch(this.FALLBACK_API);
    if (!response.ok) throw new Error(`Fallback API failed: ${response.status}`);
    
    const data = await response.json();
    return data.rates;
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    
    const now = Date.now();
    return (now - this.cache.timestamp) < this.cache.ttl;
  }

  private updateCache(rates: ExchangeRates): void {
    this.cache = {
      rates,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    };
  }

  clearCache(): void {
    this.cache = null;
  }

  getCacheInfo(): { cached: boolean; age?: number; ttl?: number } {
    if (!this.cache) {
      return { cached: false };
    }

    const age = Date.now() - this.cache.timestamp;
    return {
      cached: true,
      age,
      ttl: this.cache.ttl
    };
  }
}

export const exchangeRateService = new ExchangeRateService();
export type { ExchangeRates };