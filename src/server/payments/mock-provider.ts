import { createHmac, timingSafeEqual } from "crypto";
import { randomBytes } from "crypto";
import type {
  NormalizedProviderEvent,
  OnrampSession,
  OnrampSessionInput,
  PaymentProvider,
  PayoutInput,
  PayoutResult,
} from "./types";

const SIGNATURE_HEADER = "x-advers-signature";

function webhookSecret(): string {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("PAYMENT_WEBHOOK_SECRET is required in production.");
  }
  return "advers-dev-webhook-secret";
}

export function signMockWebhook(rawBody: string): string {
  return createHmac("sha256", webhookSecret()).update(rawBody).digest("hex");
}

export const mockProvider: PaymentProvider = {
  name: "mock",

  async createOnrampSession(input: OnrampSessionInput): Promise<OnrampSession> {
    const reference = `mock_onramp_${randomBytes(8).toString("hex")}`;
    return {
      provider: "mock",
      providerReference: reference,
      checkoutUrl: `/portal/wallet/checkout/${input.reference}`,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  },

  async createPayout(input: PayoutInput): Promise<PayoutResult> {
    return {
      provider: "mock",
      providerReference: `mock_payout_${randomBytes(8).toString("hex")}`,
      status: "PAID",
    };
  },

  verifyWebhook(rawBody: string, headers: Headers): boolean {
    const provided = headers.get(SIGNATURE_HEADER);
    if (!provided) return false;
    const expected = signMockWebhook(rawBody);
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  },

  parseWebhook(rawBody: string): NormalizedProviderEvent {
    const payload = JSON.parse(rawBody) as {
      id?: string;
      eventId?: string;
      type?: string;
      data?: Record<string, unknown>;
    };
    const eventId = payload.eventId ?? payload.id;
    if (!eventId || !payload.type) {
      throw new Error("Webhook payload needs eventId and type.");
    }
    return {
      eventId,
      type: payload.type,
      data: payload.data ?? {},
    };
  },
};
