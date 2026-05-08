export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to EUR
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  // Europe
  EUR: { code: "EUR", symbol: "€",  name: "Euro",               rate: 1       },
  GBP: { code: "GBP", symbol: "£",  name: "British Pound",      rate: 0.86    },
  PLN: { code: "PLN", symbol: "zł", name: "Polish Zloty",       rate: 4.28    },
  CZK: { code: "CZK", symbol: "Kč", name: "Czech Koruna",       rate: 25.2    },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc",        rate: 0.97    },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona",      rate: 11.6    },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone",       rate: 7.46    },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone",    rate: 11.8    },
  HUF: { code: "HUF", symbol: "Ft", name: "Hungarian Forint",   rate: 390     },
  RON: { code: "RON", symbol: "lei",name: "Romanian Leu",       rate: 4.97    },
  // International
  USD: { code: "USD", symbol: "$",  name: "US Dollar",          rate: 1.08    },
  // Latin America
  MXN: { code: "MXN", symbol: "$",  name: "Mexican Peso",       rate: 19.8    },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real",     rate: 5.50    },
  COP: { code: "COP", symbol: "$",  name: "Colombian Peso",     rate: 4500    },
  ARS: { code: "ARS", symbol: "$",  name: "Argentine Peso",     rate: 1050    },
  CLP: { code: "CLP", symbol: "$",  name: "Chilean Peso",       rate: 1010    },
  PEN: { code: "PEN", symbol: "S/", name: "Peruvian Sol",       rate: 4.05    },
  UYU: { code: "UYU", symbol: "$U", name: "Uruguayan Peso",     rate: 44.5    },
  BOB: { code: "BOB", symbol: "Bs", name: "Bolivian Boliviano", rate: 7.48    },
};

// ISO 3166-1 alpha-2 country → currency code
const COUNTRY_CURRENCY: Record<string, string> = {
  // Eurozone
  DE: "EUR", AT: "EUR", FR: "EUR", ES: "EUR", IT: "EUR",
  PT: "EUR", NL: "EUR", BE: "EUR", LU: "EUR", FI: "EUR",
  IE: "EUR", GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", MT: "EUR", CY: "EUR",
  // Other European
  GB: "GBP", PL: "PLN", CZ: "CZK", CH: "CHF",
  SE: "SEK", DK: "DKK", NO: "NOK", HU: "HUF", RO: "RON",
  // Latin America
  MX: "MXN", BR: "BRL", CO: "COP", AR: "ARS",
  CL: "CLP", PE: "PEN", UY: "UYU", BO: "BOB",
  VE: "USD", EC: "USD", PY: "USD", GT: "USD",
  HN: "USD", SV: "USD", NI: "USD", CR: "USD",
  PA: "USD", DO: "USD", CU: "USD",
};

export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY[countryCode?.toUpperCase()] ?? "USD";
}

export function convertPrice(
  priceInEur: number,
  targetCurrencyCode: string
): number {
  const config = CURRENCIES[targetCurrencyCode] ?? CURRENCIES.EUR;
  return priceInEur * config.rate;
}

export function formatPrice(priceInEur: number, currencyCode: string): string {
  const config = CURRENCIES[currencyCode] ?? CURRENCIES.EUR;
  const converted = convertPrice(priceInEur, currencyCode);

  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: config.code,
    maximumFractionDigits: 0,
  }).format(converted);
}

export const CURRENCY_COOKIE = "eg-currency";
export const DEFAULT_CURRENCY = "EUR";
