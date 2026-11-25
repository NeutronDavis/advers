import type { PaymentNetwork } from "@/lib/money";

export interface OnrampSessionInput {
  userId: string;
  reference: string;
  amountNgn: string;
  amountUsdc: string;
  network: PaymentNetwork;
}

export interface OnrampSession {
  provider: string;
  providerReference: string;
  checkoutUrl: string;
  status: "PENDING" | "FAILED";
  expiresAt: Date;
}

export interface PayoutInput {
  userId: string;
  reference: string;
  amountUsdc: string;
  address: string;
  network: PaymentNetwork;
}

export interface PayoutResult {
  provider: string;
  providerReference: string;
  status: "PROCESSING" | "PAID" | "FAILED";
}

export interface NormalizedProviderEvent {
  eventId: string;
  type: string;
  data: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  createOnrampSession(input: OnrampSessionInput): Promise<OnrampSession>;
  createPayout(input: PayoutInput): Promise<PayoutResult>;
  verifyWebhook(rawBody: string, headers: Headers): boolean;
  parseWebhook(rawBody: string): NormalizedProviderEvent;
}
