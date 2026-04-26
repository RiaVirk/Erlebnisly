/**
 * Converts a user-entered price string like "50.00" or "49,99" to integer cents.
 * Throws if the value is not a valid positive number.
 */
export function eurosStringToCents(s: string): number {
  // Accept both "49.99" (EN) and "49,99" (DE) formats
  const normalized = s.trim().replace(",", ".");
  const n = Number(normalized);
  if (Number.isNaN(n) || n < 0) throw new Error(`Invalid price: "${s}"`);
  return Math.round(n * 100);
}

/**
 * Converts integer cents to a display string: 4999 → "49.99"
 */
export function centsToCurrencyString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Formats cents as localized EUR string: 4999 → "49,99 €"
 */
export function formatCentsEUR(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}