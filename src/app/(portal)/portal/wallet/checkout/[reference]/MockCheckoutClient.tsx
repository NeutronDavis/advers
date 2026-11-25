"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, Loader2, ShieldCheck } from "lucide-react";
import { formatMoney, fromMoneyDTO, type CurrencyCode } from "@/lib/money";
import { completeMockOnrampAction } from "@/server/actions/wallet";

export default function MockCheckoutClient({
  reference,
  description,
  amountMinor,
  currency,
  network,
  status,
  providerName,
}: {
  reference: string;
  description: string;
  amountMinor: string;
  currency: string;
  network: string | null;
  status: string;
  providerName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const safeCurrency: CurrencyCode = currency === "USDC" ? "USDC" : "NGN";
  const amount = formatMoney(
    fromMoneyDTO({
      amountMinor,
      currency: safeCurrency,
      network: network === "POLYGON" ? "POLYGON" : undefined,
    })
  );

  const complete = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeMockOnrampAction(reference);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/portal/wallet?funded=1");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-5">
      <Link
        href="/portal/wallet"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--portal-muted)] hover:text-[var(--portal-ink)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to wallet
      </Link>

      <div className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
          <FlaskConical className="h-4 w-4" />
          Sandbox checkout
        </div>
        <h1 className="text-2xl font-black text-[var(--portal-ink)]">
          {amount}
        </h1>
        <p className="mt-1 text-xs text-[var(--portal-muted)]">{description}</p>

        <dl className="mt-5 space-y-2 rounded-xl bg-[var(--portal-soft)] p-4 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--portal-muted)]">Reference</dt>
            <dd className="font-mono font-bold text-[var(--portal-ink)]">{reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--portal-muted)]">Provider</dt>
            <dd className="font-bold text-[var(--portal-ink)]">{providerName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--portal-muted)]">Network</dt>
            <dd className="font-bold text-[var(--portal-ink)]">{network ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--portal-muted)]">Status</dt>
            <dd className="font-bold text-[var(--portal-ink)]">{status}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--portal-line)] p-3 text-[11px] text-[var(--portal-muted)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--portal-success)]" />
          <span>
            No real money moves in sandbox mode. This simulates the provider
            webhook so the ledger, balance and transaction history can be tested
            end-to-end.
          </span>
        </div>

        {error && <div className="alert alert-error mt-4 text-xs">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <Link href="/portal/wallet" className="btn btn-ghost btn-sm">
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={complete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Simulate successful payment
          </button>
        </div>
      </div>
    </div>
  );
}
