export interface ParsedService {
  title: string;
  priceMin: number | null;
  priceMax: number | null;
  description?: string;
  deliveryDays?: number;
}

export interface ParsedPackage {
  name: string;
  price: number;
  deliveryDays: number | null;
  description: string | null;
  includes: string[];
}

export interface ParsedPortfolioItem {
  title: string;
  externalUrl: string;
  description: string | null;
}

export function parsePriceToInt(value: string | undefined | null): number | null {
  if (!value) return null;
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDeliveryDays(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parses the quick-entry rates textarea.
 * Format: Service title | Amount | optional description | optional delivery days
 */
export function parseServiceLines(input: string): ParsedService[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, amount, description, delivery] = line
        .split("|")
        .map((part) => part.trim());
      return {
        title: title || "",
        priceMin: parsePriceToInt(amount),
        priceMax: parsePriceToInt(amount),
        description: description || undefined,
        deliveryDays: parseDeliveryDays(delivery) ?? undefined,
      };
    })
    .filter((item) => item.title.length > 0);
}

/**
 * Parses packages.
 * Format: Package name | Price | delivery days | description | includes (comma separated)
 */
export function parsePackageLines(input: string): ParsedPackage[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, amount, days, description, includes] = line
        .split("|")
        .map((part) => part.trim());
      const price = parsePriceToInt(amount);
      return {
        name: name || "",
        price: price ?? 0,
        deliveryDays: parseDeliveryDays(days),
        description: description || null,
        includes: includes
          ? includes
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };
    })
    .filter((item) => item.name.length > 0 && item.price > 0);
}

/**
 * Parses portfolio lines.
 * Format: Title | URL | description
 */
export function parsePortfolioLines(input: string): ParsedPortfolioItem[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, url, description] = line.split("|").map((part) => part.trim());
      return {
        title: title || "",
        externalUrl: url || "",
        description: description || null,
      };
    })
    .filter((item) => item.title.length > 0 && item.externalUrl.length > 0);
}
