import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { userProfileAtom } from '@/stores/profile'
import { exchangeRateAtom } from '@/stores/exchageRate'
import { convertCurrency, formatCurrency } from '@/lib/utils/currency'

/**
 * Hook that provides a function to format prices according to user's preferred currency
 * Automatically handles currency conversion and formatting
 */
export function useFormatUserPrice() {
  const userProfile = useAtomValue(userProfileAtom)
  const exchangeRates = useAtomValue(exchangeRateAtom)
  
  return useCallback((price: number): string => {
    // Get user's preferred currency, fallback to THB
    const preferredCurrency = userProfile.data?.PreferredCurrency || 'THB'
    
    // Get exchange rates data, fallback to empty object
    const rates = exchangeRates.data?.Rates || {}
    
    // Convert price from THB (base currency) to user's preferred currency
    const convertedPrice = convertCurrency(price, 'THB', preferredCurrency, rates)
    
    // Format using the standard currency formatter
    return formatCurrency(convertedPrice, preferredCurrency)
  }, [userProfile.data?.PreferredCurrency, exchangeRates.data?.Rates])
}

/**
 * Hook that provides the user's preferred currency
 */
export function useUserCurrency() {
  const userProfile = useAtomValue(userProfileAtom)
  return userProfile.data?.PreferredCurrency || 'THB'
}