import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function encryptionKey(): Buffer {
  const configured =
    process.env.TOTP_ENCRYPTION_KEY ?? process.env.SECRET_ENCRYPTION_KEY;

  if (configured) {
    const value = configured.trim();
    if (/^[0-9a-fA-F]{64}$/.test(value)) {
      return Buffer.from(value, "hex");
    }
    const decoded = Buffer.from(value, "base64");
    if (decoded.length === 32) return decoded;
    throw new Error(
      "TOTP_ENCRYPTION_KEY must be 32 bytes encoded as base64 or 64 hex characters."
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("TOTP_ENCRYPTION_KEY is required in production.");
  }

  // Development/test fallback: derive a stable key from the session secret.
  return scryptSync(
    process.env.NEXTAUTH_SECRET ?? "advers-development-secret",
    "advers-totp-v1",
    32
  );
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSecret(payload: string): string {
  const [version, ivPart, tagPart, ciphertextPart] = payload.split(".");
  if (
    version !== VERSION ||
    !ivPart ||
    !tagPart ||
    !ciphertextPart
  ) {
    throw new Error("Unsupported encrypted secret format.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
