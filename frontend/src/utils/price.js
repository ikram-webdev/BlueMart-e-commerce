export function formatPkr(amount) {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `PKR ${value.toFixed(2)}`;
  }
}
