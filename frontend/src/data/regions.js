/**
 * Demo regions: base prices in the app are USD.
 * `rateFromUsd` multiplies the USD amount to local currency (approximate for demo).
 */
export const regions = [
  { id: "US", country: "United States", currency: "USD", rateFromUsd: 1, locale: "en-US" },
  { id: "GB", country: "United Kingdom", currency: "GBP", rateFromUsd: 0.79, locale: "en-GB" },
  { id: "EU", country: "Germany (EUR)", currency: "EUR", rateFromUsd: 0.92, locale: "de-DE" },
  { id: "BD", country: "Bangladesh", currency: "BDT", rateFromUsd: 110, locale: "bn-BD" },
  { id: "IN", country: "India", currency: "INR", rateFromUsd: 83, locale: "en-IN" },
  { id: "PK", country: "Pakistan", currency: "PKR", rateFromUsd: 278, locale: "en-PK" },
  { id: "AE", country: "United Arab Emirates", currency: "AED", rateFromUsd: 3.67, locale: "en-AE" },
  { id: "SA", country: "Saudi Arabia", currency: "SAR", rateFromUsd: 3.75, locale: "en-SA" },
  { id: "CA", country: "Canada", currency: "CAD", rateFromUsd: 1.36, locale: "en-CA" },
  { id: "AU", country: "Australia", currency: "AUD", rateFromUsd: 1.52, locale: "en-AU" },
  { id: "JP", country: "Japan", currency: "JPY", rateFromUsd: 149, locale: "ja-JP" },
];

export const defaultRegionId = "PK";

export function getRegionById(id) {
  return regions.find((r) => r.id === id) || regions[0];
}
