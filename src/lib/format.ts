/**
 * Formats a price in Egyptian Pounds (EGP) for Arabic RTL display.
 */
export function formatPriceEGP(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}
