// Pure helpers for working with money as integer cents.
// All amounts in the app are integer cents. Floats are never used for money.

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Parse a user-entered amount string into integer cents.
 * Accepts forms like "12", "12.5", "12.50", " 1,234.56 ".
 * Returns null when the input is not a non-negative finite number.
 */
export function parseAmountToCents(input: string): number | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const padded = (fraction + "00").slice(0, 2);
  const cents = Number(whole) * 100 + Number(padded);
  if (!Number.isFinite(cents) || cents < 0) return null;
  return cents;
}

/**
 * Format integer cents as a display string for the given currency.
 * Negative values are rendered with a leading minus sign before the symbol.
 */
export function formatCents(cents: number, currency: string): string {
  const code = (currency || "").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? code;
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const remainder = abs % 100;
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const remainderStr = remainder.toString().padStart(2, "0");
  const body = `${wholeStr}.${remainderStr}`;
  const prefix = negative ? "-" : "";
  if (symbol === code) {
    return `${prefix}${body} ${code}`.trim();
  }
  return `${prefix}${symbol}${body}`;
}

/**
 * Split an integer cents amount equally across N sharers.
 * Distributes the remainder one cent at a time to the first R sharers
 * so the shares sum exactly to the original amount.
 */
export function splitEqually(amountCents: number, sharerCount: number): number[] {
  if (sharerCount <= 0) return [];
  const base = Math.floor(amountCents / sharerCount);
  const remainder = amountCents - base * sharerCount;
  const shares = new Array<number>(sharerCount).fill(base);
  for (let i = 0; i < remainder; i++) {
    shares[i] += 1;
  }
  return shares;
}
