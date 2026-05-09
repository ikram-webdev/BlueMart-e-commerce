import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { defaultRegionId, getRegionById, regions } from "../data/regions";

const STORAGE_KEY = "bluemart_region_id";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [regionId, setRegionIdState] = useState("PK");

  const region = useMemo(() => getRegionById("PK"), []);

  const setRegionId = useCallback((id) => {
    const next = "PK";
    setRegionIdState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  /** Keep values native in PKR; do not convert backend input prices. */
  const convertFromUsd = useCallback(
    (amount) => {
      const n = Number(amount);
      if (Number.isNaN(n)) return 0;
      return n;
    },
    []
  );

  const formatPrice = useCallback(
    (usdAmount) => {
      const value = convertFromUsd(usdAmount);
      try {
        return new Intl.NumberFormat(region.locale, {
          style: "currency",
          currency: region.currency,
          currencyDisplay: "code",
          minimumFractionDigits: region.currency === "JPY" ? 0 : 2,
          maximumFractionDigits: region.currency === "JPY" ? 0 : 2,
        }).format(value);
      } catch {
        return `${region.currency} ${value.toFixed(2)}`;
      }
    },
    [convertFromUsd, region.currency, region.locale]
  );

  const value = useMemo(
    () => ({
      regions,
      region,
      regionId,
      setRegionId,
      convertFromUsd,
      formatPrice,
    }),
    [region, regionId, setRegionId, convertFromUsd, formatPrice]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
