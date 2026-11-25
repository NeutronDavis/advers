import { keccak_256 } from "@noble/hashes/sha3";
import { parseMoney, type Money, type PaymentNetwork } from "./money";
import { ledgerAccountKey } from "@/lib/ledger-account-key";

export const WALLET_NETWORK: PaymentNetwork = "POLYGON";
const ZERO_ADDRESS_BODY = "0".repeat(40);

/**
 * EIP-55 checksum encoding. Returns null for malformed or zero addresses.
 */
export function toChecksumAddress(address: string): string | null {
  const raw = address.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{40}$/.test(raw)) return null;
  if (raw.toLowerCase() === ZERO_ADDRESS_BODY) return null;

  const lower = raw.toLowerCase();
  const hashBytes = keccak_256(new TextEncoder().encode(lower));
  let hash = "";
  for (const byte of hashBytes) {
    hash += byte.toString(16).padStart(2, "0");
  }
  let checksummed = "0x";
  for (let index = 0; index < 40; index += 1) {
    checksummed +=
      Number.parseInt(hash[index], 16) >= 8
        ? lower[index].toUpperCase()
        : lower[index];
  }
  return checksummed;
}

/**
 * Accepts all-lowercase/all-uppercase addresses (not checksummed) and
 * mixed-case addresses only when the EIP-55 checksum matches.
 */
export function isValidPolygonAddress(address: string): boolean {
  const trimmed = address.trim();
  const raw = trimmed.replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{40}$/.test(raw)) return false;
  if (raw.toLowerCase() === ZERO_ADDRESS_BODY) return false;

  const hasLower = /[a-f]/.test(raw);
  const hasUpper = /[A-F]/.test(raw);
  if (!hasLower || !hasUpper) return true;

  const checksummed = toChecksumAddress(trimmed);
  return checksummed !== null && checksummed === trimmed;
}

export function normalizePolygonAddress(address: string): string {
  const trimmed = address.trim();
  return toChecksumAddress(trimmed) ?? trimmed;
}

export function paymentProviderName(): string {
  return (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
}

export function mockNgnPerUsdc(): number {
  const value = Number(process.env.MOCK_NGN_PER_USDC ?? "1600");
  return Number.isFinite(value) && value > 0 ? value : 1600;
}

export function withdrawalFeeUsdc(): string {
  const value = process.env.WITHDRAWAL_FEE_USDC ?? "0";
  try {
    parseMoney(value, "USDC");
    return value;
  } catch {
    return "0";
  }
}

/**
 * Converts an NGN amount to USDC using an integer-scaled rate.
 *
 * `rateMicro` is NGN per USDC × 1,000,000. The result is floored to the
 * smallest USDC unit; the quote records the exact rate so the rounding can be
 * audited.
 */
export function convertNgnToUsdc(amount: Money, rateNgnPerUsdc: number): Money {
  if (amount.currency !== "NGN") {
    throw new Error("Source amount must be NGN.");
  }
  if (!Number.isFinite(rateNgnPerUsdc) || rateNgnPerUsdc <= 0) {
    throw new Error("FX rate must be positive.");
  }
  const rateMicro = BigInt(Math.round(rateNgnPerUsdc * 1_000_000));
  const usdcMinor =
    (amount.amountMinor * BigInt(10_000_000_000)) / rateMicro;
  return { amountMinor: usdcMinor, currency: "USDC" };
}

export function convertUsdcToNgn(amount: Money, rateNgnPerUsdc: number): Money {
  if (amount.currency !== "USDC") {
    throw new Error("Source amount must be USDC.");
  }
  if (!Number.isFinite(rateNgnPerUsdc) || rateNgnPerUsdc <= 0) {
    throw new Error("FX rate must be positive.");
  }
  const rateMicro = BigInt(Math.round(rateNgnPerUsdc * 1_000_000));
  const ngnMinor = (amount.amountMinor * rateMicro) / BigInt(10_000_000_000);
  return { amountMinor: ngnMinor, currency: "NGN" };
}

export type AdvertiserAccountType = "AVAILABLE" | "ESCROW" | "PAYOUT_CLEARING";

export function advertiserAccountKey(
  userId: string,
  type: AdvertiserAccountType,
  currency: "NGN" | "USDC",
  network: PaymentNetwork | "NONE" = "NONE"
): string {
  return ledgerAccountKey({ userId, type, currency, network });
}
