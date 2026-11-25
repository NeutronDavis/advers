import type {
  NormalizedProviderEvent,
  OnrampSession,
  OnrampSessionInput,
  PaymentProvider,
  PayoutInput,
  PayoutResult,
} from "./types";

/**
 * Yellow Card adapter placeholder.
 *
 * The sandbox contract is not confirmed yet (see
 * `.agents/agent-plans/phase-0/provider-evaluation.md`). Implement the four
 * methods below once the sandbox endpoints and signature scheme are available.
 * Until then the factory refuses to select this provider so production cannot
 * accidentally run against an unimplemented adapter.
 */
function notConfigured(): never {
  throw new Error(
    "Yellow Card adapter is not configured. Complete the Phase 0 sandbox spike and map the on-ramp, payout, and webhook endpoints."
  );
}

export const yellowCardProvider: PaymentProvider = {
  name: "yellowcard",

  async createOnrampSession(_input: OnrampSessionInput): Promise<OnrampSession> {
    return notConfigured();
  },

  async createPayout(_input: PayoutInput): Promise<PayoutResult> {
    return notConfigured();
  },

  verifyWebhook(_rawBody: string, _headers: Headers): boolean {
    return notConfigured();
  },

  parseWebhook(_rawBody: string): NormalizedProviderEvent {
    return notConfigured();
  },
};
