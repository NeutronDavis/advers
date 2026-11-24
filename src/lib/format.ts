import {
  formatMoney,
  formatMoneyShort,
  parseMoney,
  type CurrencyCode,
  type Money,
} from "@/lib/money";

/**
 * Formats a major-unit value in the given currency using the exact money
 * formatter. Prefer `formatMoney` with a `Money` value for new code.
 */
export function formatCurrency(value: number, currency: CurrencyCode): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatMoney(parseMoney(safeValue, currency));
}

/** @deprecated Prefer `formatMoney` with an explicit currency. */
export function formatNaira(value: number): string {
  return formatCurrency(value, "NGN");
}

/** @deprecated Prefer `formatMoneyShort` with an explicit currency. */
export function formatNairaShort(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatMoneyShort(parseMoney(safeValue, "NGN"));
}

export function formatMoneyValue(money: Money): string {
  return formatMoney(money);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
