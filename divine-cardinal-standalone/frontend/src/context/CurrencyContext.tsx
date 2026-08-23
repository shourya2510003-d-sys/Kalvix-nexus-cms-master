'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR' | 'AED';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInINR: number | string) => string;
  exchangeRate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CONVERSION_RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012, // Approximate: 1 INR = 0.012 USD
  EUR: 0.011, // Approximate: 1 INR = 0.011 EUR
  AED: 0.044, // Approximate: 1 INR = 0.044 AED
};

const SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  AED: 'د.إ',
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved currency from local storage if exists
    const savedCurrency = localStorage.getItem('kalvix_currency') as Currency;
    if (savedCurrency && ['INR', 'USD', 'EUR', 'AED'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('kalvix_currency', newCurrency);
  };

  const formatPrice = (priceInINR: number | string) => {
    const numericPrice = typeof priceInINR === 'string' ? parseFloat(priceInINR) : priceInINR;
    if (isNaN(numericPrice)) return `${SYMBOLS[currency]}0.00`;

    const convertedPrice = numericPrice * CONVERSION_RATES[currency];
    
    if (!isClient) {
      // During SSR, always return INR to prevent hydration mismatch
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(numericPrice);
    }

    // Format based on currency locale
    let formatted: string;
    switch (currency) {
      case 'INR':
        formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(convertedPrice);
        break;
      case 'USD':
        formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(convertedPrice);
        break;
      case 'EUR':
        formatted = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(convertedPrice);
        break;
      case 'AED':
        // Custom formatting for AED to keep it clean like 'د.إ 15.00'
        formatted = `د.إ ${convertedPrice.toFixed(2)}`;
        break;
      default:
        formatted = `${SYMBOLS[currency]}${convertedPrice.toFixed(2)}`;
    }

    return formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, exchangeRate: CONVERSION_RATES[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
