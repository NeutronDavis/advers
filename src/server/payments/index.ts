import { paymentProviderName } from "@/lib/wallet";
import { mockProvider } from "./mock-provider";
import { yellowCardProvider } from "./yellowcard-provider";
import type { PaymentProvider } from "./types";

export type { PaymentProvider } from "./types";

export function getPaymentProvider(name = paymentProviderName()): PaymentProvider {
  const normalized = name.toLowerCase();
  if (normalized === "mock") return mockProvider;
  if (normalized === "yellowcard" || normalized === "yellow-card") {
    if (!process.env.YELLOWCARD_API_KEY) {
      throw new Error(
        "PAYMENT_PROVIDER is yellowcard but YELLOWCARD_API_KEY is missing."
      );
    }
    return yellowCardProvider;
  }
  throw new Error(`Unsupported payment provider: ${name}`);
}

export { mockProvider, yellowCardProvider };
export { signMockWebhook } from "./mock-provider";
export type {
  NormalizedProviderEvent,
  OnrampSession,
  OnrampSessionInput,
  PayoutInput,
  PayoutResult,
} from "./types";
