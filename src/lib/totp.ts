import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const DEFAULT_DIGITS = 6;
const DEFAULT_STEP_SECONDS = 30;

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const normalized = input
    .toUpperCase()
    .replace(/=+$/g, "")
    .replace(/[\s-]/g, "");

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index < 0) {
      throw new Error(`Invalid base32 character: ${character}`);
    }
    value = (value << 5) | index;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
      value &= (1 << bits) - 1;
    }
  }

  return Buffer.from(output);
}

export function generateTotpSecret(byteLength = 20): string {
  return base32Encode(randomBytes(byteLength));
}

function counterBuffer(counter: bigint): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(counter);
  return buffer;
}

export function generateHotp(
  secret: string,
  counter: bigint,
  digits = DEFAULT_DIGITS
): string {
  const key = base32Decode(secret);
  const digest = createHmac("sha1", key).update(counterBuffer(counter)).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  const code = binary % 10 ** digits;
  return code.toString().padStart(digits, "0");
}

export interface TotpOptions {
  digits?: number;
  stepSeconds?: number;
  timestamp?: number;
}

export function generateTotp(secret: string, options: TotpOptions = {}): string {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const stepSeconds = options.stepSeconds ?? DEFAULT_STEP_SECONDS;
  const timestamp = options.timestamp ?? Date.now();
  const counter = BigInt(Math.floor(timestamp / 1000 / stepSeconds));
  return generateHotp(secret, counter, digits);
}

export function verifyTotp(
  secret: string,
  token: string,
  options: TotpOptions & { window?: number } = {}
): boolean {
  const digits = options.digits ?? DEFAULT_DIGITS;
  const stepSeconds = options.stepSeconds ?? DEFAULT_STEP_SECONDS;
  const timestamp = options.timestamp ?? Date.now();
  const window = options.window ?? 1;
  const clean = token.replace(/\s/g, "");

  if (!new RegExp(`^\\d{${digits}}$`).test(clean)) return false;

  const counter = BigInt(Math.floor(timestamp / 1000 / stepSeconds));
  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = generateHotp(secret, counter + BigInt(offset), digits);
    const a = Buffer.from(candidate);
    const b = Buffer.from(clean);
    if (a.length === b.length && timingSafeEqual(a, b)) {
      return true;
    }
  }
  return false;
}

export function buildOtpauthUri(input: {
  secret: string;
  accountName: string;
  issuer?: string;
  digits?: number;
  stepSeconds?: number;
}): string {
  const issuer = input.issuer ?? "ADVERS";
  const digits = input.digits ?? DEFAULT_DIGITS;
  const period = input.stepSeconds ?? DEFAULT_STEP_SECONDS;
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(input.accountName)}`;
  const params = new URLSearchParams({
    secret: input.secret,
    issuer,
    algorithm: "SHA1",
    digits: String(digits),
    period: String(period),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const raw = base32Encode(randomBytes(5)).slice(0, 8);
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}
