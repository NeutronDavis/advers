/**
 * Exact money handling for ADVERS.
 *
 * Rules (see ADR-0001):
 * - Amounts are stored as integer minor units, never floats.
 * - The currency determines the number of decimals.
 * - `BigInt` is used in the domain; DTOs crossing the server/client boundary
 *   carry the amount as a string because React cannot serialize BigInt.
 */

export type CurrencyCode = "NGN" | "USDC";

export type PaymentNetwork =
  | "POLYGON"
  | "BASE"
  | "ETHEREUM"
  | "SOLANA";

export const CURRENCY_DECIMALS: Record<CurrencyCode, number> = {
  NGN: 2,
  USDC: 6,
};

/** Networks enabled for live settlement. See decision D-04. */
export const SUPPORTED_NETWORKS: readonly PaymentNetwork[] = ["POLYGON"];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: "₦",
  USDC: "USDC ",
};

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

export interface Money {
  amountMinor: bigint;
  currency: CurrencyCode;
}

/**
 * Serializable form used by server actions, data loaders, and client props.
 * `network` is only meaningful for on-chain currencies.
 */
export interface MoneyDTO {
  amountMinor: string;
  currency: CurrencyCode;
  network?: PaymentNetwork;
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value === "NGN" || value === "USDC";
}

export function isPaymentNetwork(value: string): value is PaymentNetwork {
  return (
    value === "POLYGON" ||
    value === "BASE" ||
    value === "ETHEREUM" ||
    value === "SOLANA"
  );
}

export function assertSupportedNetwork(network: string): PaymentNetwork {
  if (!isPaymentNetwork(network)) {
    throw new Error(`Unsupported payment network: ${network}`);
  }
  if (!SUPPORTED_NETWORKS.includes(network)) {
    throw new Error(
      `Network ${network} is not enabled. Enabled: ${SUPPORTED_NETWORKS.join(", ")}`
    );
  }
  return network;
}

function pow10(exponent: number): bigint {
  let result = ONE;
  for (let index = 0; index < exponent; index += 1) {
    result *= TEN;
  }
  return result;
}

export function decimalsFor(currency: CurrencyCode): number {
  return CURRENCY_DECIMALS[currency];
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(
      `Cannot combine ${a.currency} and ${b.currency}; convert through an FX quote first.`
    );
  }
}

/**
 * Parses a human-entered decimal string into exact minor units.
 * Rejects excess precision instead of silently rounding.
 */
export function parseMoney(
  input: string | number | bigint,
  currency: CurrencyCode
): Money {
  let raw: string;

  if (typeof input === "bigint") {
    raw = input.toString();
  } else if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new Error("Amount must be a finite number.");
    }
    raw = String(input);
  } else {
    raw = input.trim().replace(/,/g, "");
  }

  if (raw === "") {
    throw new Error("Amount is required.");
  }
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid amount: ${raw}`);
  }

  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "");
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  const decimals = decimalsFor(currency);

  if (fractionPart.length > decimals) {
    const excess = fractionPart.slice(decimals);
    if (/[1-9]/.test(excess)) {
      throw new Error(
        `Too many decimal places for ${currency}; maximum is ${decimals}.`
      );
    }
  }

  const paddedFraction = (fractionPart + "0".repeat(decimals)).slice(0, decimals);
  const amount =
    BigInt(wholePart || "0") * pow10(decimals) +
    BigInt(paddedFraction || "0");

  return {
    amountMinor: negative ? -amount : amount,
    currency,
  };
}

export function parseMoneyOrDefault(
  input: string | number | bigint | null | undefined,
  currency: CurrencyCode
): Money {
  if (input === null || input === undefined || input === "") {
    return { amountMinor: ZERO, currency };
  }
  return parseMoney(input, currency);
}

/** Converts legacy whole-Naira integers into NGN minor units. */
export function moneyFromLegacyNaira(value: number | bigint): Money {
  if (typeof value === "number" && !Number.isInteger(value)) {
    throw new Error("Legacy Naira values must be whole integers.");
  }
  return {
    amountMinor: BigInt(value) * pow10(decimalsFor("NGN")),
    currency: "NGN",
  };
}

/**
 * Builds a DTO for a row that may have been backfilled. Falls back to the
 * legacy whole-Naira column when the minor-unit value is still null.
 */
export function legacyMoneyDTO(
  legacyNaira: number,
  minor: bigint | null | undefined,
  currency = "NGN",
  network?: PaymentNetwork
): MoneyDTO {
  if (minor !== null && minor !== undefined) {
    return {
      amountMinor: minor.toString(),
      currency: isCurrencyCode(currency) ? currency : "NGN",
      ...(network ? { network } : {}),
    };
  }
  return toMoneyDTO(moneyFromLegacyNaira(legacyNaira), network);
}

export function toMoneyDTO(money: Money, network?: PaymentNetwork): MoneyDTO {
  return {
    amountMinor: money.amountMinor.toString(),
    currency: money.currency,
    ...(network ? { network } : {}),
  };
}

export function fromMoneyDTO(dto: MoneyDTO): Money {
  if (!isCurrencyCode(dto.currency)) {
    throw new Error(`Unsupported currency: ${String(dto.currency)}`);
  }
  if (!/^-?\d+$/.test(dto.amountMinor)) {
    throw new Error(`Invalid minor amount: ${dto.amountMinor}`);
  }
  return {
    amountMinor: BigInt(dto.amountMinor),
    currency: dto.currency,
  };
}

export function zeroMoney(currency: CurrencyCode): Money {
  return { amountMinor: ZERO, currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function negateMoney(money: Money): Money {
  return { amountMinor: -money.amountMinor, currency: money.currency };
}

export function absMoney(money: Money): Money {
  return {
    amountMinor: money.amountMinor < ZERO ? -money.amountMinor : money.amountMinor,
    currency: money.currency,
  };
}

export function sumMoney(values: Money[], currency: CurrencyCode): Money {
  return values.reduce(
    (total, value) => addMoney(total, value),
    zeroMoney(currency)
  );
}

export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b);
  if (a.amountMinor < b.amountMinor) return -1;
  if (a.amountMinor > b.amountMinor) return 1;
  return 0;
}

export function isZeroMoney(money: Money): boolean {
  return money.amountMinor === ZERO;
}

export function isNegativeMoney(money: Money): boolean {
  return money.amountMinor < ZERO;
}

/**
 * Exact decimal string in major units, with the currency's full precision.
 * Use this at provider boundaries that expect a decimal string.
 */
export function toDecimalString(money: Money): string {
  const decimals = decimalsFor(money.currency);
  const negative = money.amountMinor < ZERO;
  const absolute = negative ? -money.amountMinor : money.amountMinor;
  const scale = pow10(decimals);
  const whole = absolute / scale;
  const fraction = (absolute % scale).toString().padStart(decimals, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${fraction}`;
}

/**
 * Exact display formatter. Does not go through `Number`, so large balances and
 * six-decimal USDC amounts are printed without precision loss.
 */
export function formatMoney(money: Money, locale = "en-NG"): string {
  const decimals = decimalsFor(money.currency);
  const negative = money.amountMinor < ZERO;
  const absolute = negative ? -money.amountMinor : money.amountMinor;
  const scale = pow10(decimals);
  const whole = absolute / scale;
  const fraction = absolute % scale;

  const minimumFractionDigits = money.currency === "USDC" ? 2 : 0;
  let fractionText = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  if (fractionText.length < minimumFractionDigits) {
    fractionText = fractionText.padEnd(minimumFractionDigits, "0");
  }

  const groupedWhole = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(whole);

  const prefix = negative ? "-" : "";
  const symbol = CURRENCY_SYMBOLS[money.currency];
  const fractionSuffix = fractionText ? `.${fractionText}` : "";

  return `${prefix}${symbol}${groupedWhole}${fractionSuffix}`;
}

/** Compact display for dashboards: ₦1.5M, USDC 12.4k. */
export function formatMoneyShort(money: Money): string {
  const decimals = decimalsFor(money.currency);
  const negative = money.amountMinor < ZERO;
  const absolute = negative ? -money.amountMinor : money.amountMinor;
  const whole = Number(absolute / pow10(decimals));

  if (whole >= 1_000_000) {
    return `${negative ? "-" : ""}${CURRENCY_SYMBOLS[money.currency]}${(
      whole / 1_000_000
    ).toFixed(1)}M`;
  }
  if (whole >= 1_000) {
    return `${negative ? "-" : ""}${CURRENCY_SYMBOLS[money.currency]}${(
      whole / 1_000
    ).toFixed(0)}k`;
  }
  return formatMoney(money);
}
