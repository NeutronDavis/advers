"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import type { MoneyDTO } from "@/lib/money";
import {
  formatMoney,
  fromMoneyDTO,
  parseMoney,
} from "@/lib/money";
import { convertNgnToUsdc } from "@/lib/wallet";
import { formatDate } from "@/lib/format";
import type { WalletOverview } from "@/server/data/wallet";
import {
  addPayoutDestinationAction,
  disablePayoutDestinationAction,
  fundWalletAction,
  requestAdvertiserWithdrawalAction,
  setDefaultPayoutDestinationAction,
  verifyWithdrawalStepUpAction,
} from "@/server/actions/wallet";

function money(dto: MoneyDTO) {
  return fromMoneyDTO(dto);
}

function fmt(dto: MoneyDTO): string {
  return formatMoney(money(dto));
}

function statusBadge(status: string): string {
  if (["SUCCESS", "PAID", "COMPLETED"].includes(status)) {
    return "badge badge-success badge-sm";
  }
  if (["PENDING", "PROCESSING", "REQUESTED", "UNDER_REVIEW"].includes(status)) {
    return "badge badge-warning badge-sm";
  }
  if (["FAILED", "REJECTED", "CANCELLED"].includes(status)) {
    return "badge badge-error badge-sm";
  }
  return "badge badge-ghost badge-sm";
}

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `wdr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function WalletClient({ overview }: { overview: WalletOverview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<"fund" | "withdraw" | "address" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destinationId, setDestinationId] = useState(
    overview.destinations.find((item) => item.isDefault)?.id ??
      overview.destinations[0]?.id ??
      ""
  );
  const [totpCode, setTotpCode] = useState("");
  const [stepUpToken, setStepUpToken] = useState<string | null>(null);
  const [withdrawalKey, setWithdrawalKey] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [addressValue, setAddressValue] = useState("");

  const fundEstimate = useMemo(() => {
    if (!fundAmount.trim()) return "—";
    try {
      const ngn = parseMoney(fundAmount, "NGN");
      const usdc = convertNgnToUsdc(ngn, overview.fxRate);
      return formatMoney(usdc);
    } catch {
      return "—";
    }
  }, [fundAmount, overview.fxRate]);

  const withdrawTotal = useMemo(() => {
    if (!withdrawAmount.trim()) return null;
    try {
      const amount = parseMoney(withdrawAmount, "USDC");
      const fee = money(overview.withdrawalFee);
      return {
        amountMinor: amount.amountMinor + fee.amountMinor,
        currency: "USDC" as const,
      };
    } catch {
      return null;
    }
  }, [withdrawAmount, overview.withdrawalFee]);

  const closeModal = () => {
    setModal(null);
    setError(null);
    setStepUpToken(null);
    setWithdrawalKey("");
    setTotpCode("");
  };

  const submitFunding = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await fundWalletAction({ amountNgn: fundAmount });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(result.checkoutUrl);
    });
  };

  const verifyCode = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyWithdrawalStepUpAction({ code: totpCode });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setStepUpToken(result.token);
      setWithdrawalKey(newIdempotencyKey());
    });
  };

  const submitWithdrawal = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!stepUpToken) {
      setError("Verify your authenticator code first.");
      return;
    }
    if (!destinationId) {
      setError("Add a payout address first.");
      return;
    }
    startTransition(async () => {
      const result = await requestAdvertiserWithdrawalAction({
        destinationId,
        amountUsdc: withdrawAmount,
        stepUpToken,
        idempotencyKey: withdrawalKey || newIdempotencyKey(),
      });
      if (!result.success) {
        setError(result.error);
        setStepUpToken(null);
        return;
      }
      setNotice(
        result.status === "PAID"
          ? "Withdrawal sent to your wallet."
          : "Withdrawal submitted and is processing."
      );
      setModal(null);
      setStepUpToken(null);
      setWithdrawalKey("");
      setTotpCode("");
      setWithdrawAmount("");
      router.refresh();
    });
  };

  const addAddress = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addPayoutDestinationAction({
        label: addressLabel,
        address: addressValue,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAddressLabel("");
      setAddressValue("");
      setNotice("Payout address saved.");
      setModal(null);
      router.refresh();
    });
  };

  const makeDefault = (id: string) => {
    startTransition(async () => {
      const result = await setDefaultPayoutDestinationAction(id);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  };

  const disableAddress = (id: string) => {
    startTransition(async () => {
      const result = await disablePayoutDestinationAction(id);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--portal-line)] pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            USDC wallet &amp; payouts
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--portal-ink)] sm:text-3xl">
            Wallet
          </h1>
          <p className="mt-0.5 text-xs text-[var(--portal-muted)] sm:text-sm">
            Fund with Naira, hold USDC on {overview.network}, and withdraw to your
            verified wallet.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <a
            href="/portal/wallet/statement"
            className="btn btn-ghost btn-sm rounded-xl"
          >
            <Download className="h-4 w-4" />
            Export statement
          </a>
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl"
            onClick={() => {
              setModal("fund");
              setError(null);
            }}
          >
            <CreditCard className="h-4 w-4" />
            Fund wallet
          </button>
          <button
            type="button"
            className="btn btn-neutral btn-sm rounded-xl"
            onClick={() => {
              setModal("withdraw");
              setError(null);
            }}
          >
            <ArrowUpRight className="h-4 w-4" />
            Withdraw
          </button>
        </div>
      </div>

      {notice && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}
      {error && !modal && (
        <div className="alert alert-error text-xs">
          <span>{error}</span>
        </div>
      )}

      {!overview.twoFactorEnabled && (
        <div className="alert alert-warning text-xs">
          <ShieldCheck className="h-4 w-4" />
          <span>
            Withdrawals require two-factor authentication.{" "}
            <Link className="link font-bold" href="/portal/settings/security">
              Set it up now
            </Link>
            .
          </span>
        </div>
      )}

      <div className="stats stats-vertical w-full border border-[var(--portal-line)] bg-[var(--portal-surface)] shadow-xs lg:stats-horizontal">
        <div className="stat">
          <div className="stat-title text-[11px] font-bold uppercase tracking-wide">
            Available USDC
          </div>
          <div className="stat-value text-2xl font-black text-[var(--portal-ink)] sm:text-3xl">
            {fmt(overview.available)}
          </div>
          <div className="stat-desc text-[11px]">
            {overview.network} · {overview.provider === "mock" ? "Sandbox provider" : overview.provider}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-[11px] font-bold uppercase tracking-wide">
            Locked in escrow
          </div>
          <div className="stat-value text-2xl font-bold text-[var(--portal-ink)] sm:text-3xl">
            {fmt(overview.escrow)}
          </div>
          <div className="stat-desc text-[11px]">Released after campaign proof</div>
        </div>
        <div className="stat">
          <div className="stat-title text-[11px] font-bold uppercase tracking-wide">
            Total deployed
          </div>
          <div className="stat-value text-2xl font-bold text-[var(--portal-ink)] sm:text-3xl">
            {fmt(overview.totalSpent)}
          </div>
          <div className="stat-desc text-[11px]">Across all channels</div>
        </div>
      </div>

      {overview.legacyNgnAvailable && (
        <div className="rounded-2xl border border-[var(--portal-line)] bg-[var(--portal-soft)] p-4 text-xs text-[var(--portal-muted)]">
          Legacy Naira balance:{" "}
          <span className="font-bold text-[var(--portal-ink)]">
            {fmt(overview.legacyNgnAvailable)}
          </span>
          {overview.legacyNgnEscrow && (
            <>
              {" "}
              and{" "}
              <span className="font-bold text-[var(--portal-ink)]">
                {fmt(overview.legacyNgnEscrow)}
              </span>{" "}
              in escrow
            </>
          )}
          . It is kept separate from your USDC wallet until finance converts it.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--portal-ink)]">
                Payout addresses
              </h2>
              <p className="text-[11px] text-[var(--portal-muted)]">
                Only {overview.network} USDC addresses are accepted.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs rounded-lg"
              onClick={() => {
                setModal("address");
                setError(null);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {overview.destinations.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--portal-line)] p-4 text-center text-xs text-[var(--portal-muted)]">
                No payout address yet. Add one before withdrawing.
              </div>
            )}
            {overview.destinations.map((destination) => (
              <div
                key={destination.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--portal-line)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--portal-ink)]">
                      {destination.label}
                    </span>
                    {destination.isDefault && (
                      <span className="badge badge-primary badge-xs">Default</span>
                    )}
                    {destination.status !== "ACTIVE" && (
                      <span className="badge badge-ghost badge-xs">Disabled</span>
                    )}
                  </div>
                  <div className="truncate font-mono text-[10px] text-[var(--portal-muted)]">
                    {destination.address}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!destination.isDefault && destination.status === "ACTIVE" && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => makeDefault(destination.id)}
                      disabled={isPending}
                    >
                      Make default
                    </button>
                  )}
                  {destination.status === "ACTIVE" && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => disableAddress(destination.id)}
                      disabled={isPending}
                      aria-label={`Disable ${destination.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
          <h2 className="text-base font-bold text-[var(--portal-ink)]">
            Withdrawal requests
          </h2>
          <p className="mb-3 text-[11px] text-[var(--portal-muted)]">
            {overview.twoFactorEnabled
              ? `${overview.recoveryCodesRemaining} recovery codes remaining.`
              : "Two-factor authentication is required."}
          </p>
          <div className="space-y-2">
            {overview.withdrawals.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--portal-line)] p-4 text-center text-xs text-[var(--portal-muted)]">
                No withdrawals yet.
              </div>
            )}
            {overview.withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--portal-line)] p-3"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {fmt(withdrawal.amountMoney)}
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)]">
                    {withdrawal.destinationLabel ?? "Wallet"} ·{" "}
                    {formatDate(withdrawal.requestedAt)}
                  </div>
                </div>
                <span className={statusBadge(withdrawal.status)}>
                  {withdrawal.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card border border-[var(--portal-line)] bg-[var(--portal-surface)] p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--portal-ink)]">
              Recent activity
            </h2>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Funding, escrow and payout movements.
            </p>
          </div>
          <Wallet className="h-4 w-4 text-[var(--portal-gold-ink)]" />
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Reference</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[var(--portal-muted)]">
                    No wallet activity yet. Fund your wallet to get started.
                  </td>
                </tr>
              )}
              {overview.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          transaction.direction === "IN"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {transaction.direction === "IN" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[var(--portal-ink)]">
                          {transaction.type.replace(/_/g, " ")}
                        </div>
                        <div className="text-[10px] text-[var(--portal-muted)]">
                          {transaction.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-[10px] text-[var(--portal-muted)]">
                    {transaction.reference}
                  </td>
                  <td className="text-[11px] text-[var(--portal-muted)]">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="text-right text-xs font-black text-[var(--portal-ink)]">
                    {transaction.direction === "OUT" ? "-" : "+"}
                    {fmt(transaction.amountMoney)}
                  </td>
                  <td className="text-right">
                    <span className={statusBadge(transaction.status)}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal === "fund" && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold">Fund wallet</h3>
            <p className="py-2 text-xs text-[var(--portal-muted)]">
              Pay in Naira. You receive USDC at the locked sandbox rate of ₦
              {overview.fxRate.toLocaleString("en-NG")}/USDC. Minimum ₦1,000.
            </p>
            <form onSubmit={submitFunding} className="space-y-4">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Amount (NGN)</span>
                <input
                  className="input input-bordered w-full"
                  inputMode="decimal"
                  placeholder="e.g. 160000"
                  value={fundAmount}
                  onChange={(event) => setFundAmount(event.target.value)}
                  required
                />
              </label>
              <div className="rounded-xl bg-base-200 p-3 text-xs">
                You will receive{" "}
                <span className="font-black text-base-content">{fundEstimate}</span>
                {overview.provider === "mock" && (
                  <span className="ml-1 text-base-content/60">
                    (sandbox — no real charge)
                  </span>
                )}
              </div>
              {error && <div className="alert alert-error text-xs">{error}</div>}
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Continue
                </button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" onClick={closeModal} aria-label="Close" />
        </div>
      )}

      {modal === "withdraw" && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold">Withdraw USDC</h3>
            <p className="py-2 text-xs text-[var(--portal-muted)]">
              Available: {fmt(overview.available)}. Fee: {fmt(overview.withdrawalFee)}.
            </p>
            <form onSubmit={submitWithdrawal} className="space-y-3">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Payout address</span>
                <select
                  className="select select-bordered w-full"
                  value={destinationId}
                  onChange={(event) => setDestinationId(event.target.value)}
                  required
                >
                  <option value="">Choose an address</option>
                  {overview.destinations
                    .filter((destination) => destination.status === "ACTIVE")
                    .map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.label} — {destination.address.slice(0, 8)}…
                      </option>
                    ))}
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Amount (USDC)</span>
                <input
                  className="input input-bordered w-full"
                  inputMode="decimal"
                  placeholder="e.g. 25.00"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  required
                />
              </label>

              {withdrawTotal && (
                <div className="rounded-xl bg-base-200 p-3 text-xs">
                  Total debit:{" "}
                  <span className="font-black">{formatMoney(withdrawTotal)}</span>{" "}
                  including fee
                </div>
              )}

              <div className="rounded-xl border border-base-300 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Authenticator verification
                </div>
                {stepUpToken ? (
                  <div className="badge badge-success badge-sm">
                    Verified for this withdrawal
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="input input-bordered w-full font-mono"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={totpCode}
                      onChange={(event) => setTotpCode(event.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={verifyCode}
                      disabled={isPending || totpCode.trim().length < 6}
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {error && <div className="alert alert-error text-xs">{error}</div>}
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isPending || !stepUpToken}
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Request withdrawal
                </button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" onClick={closeModal} aria-label="Close" />
        </div>
      )}

      {modal === "address" && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold">Add payout address</h3>
            <p className="py-2 text-xs text-[var(--portal-muted)]">
              Paste a Polygon USDC wallet address you control. Network mismatches
              can permanently lose funds.
            </p>
            <form onSubmit={addAddress} className="space-y-3">
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">Label</span>
                <input
                  className="input input-bordered w-full"
                  placeholder="e.g. My Polygon wallet"
                  value={addressLabel}
                  onChange={(event) => setAddressLabel(event.target.value)}
                  required
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text text-xs font-bold">USDC address (Polygon)</span>
                <input
                  className="input input-bordered w-full font-mono text-xs"
                  placeholder="0x…"
                  value={addressValue}
                  onChange={(event) => setAddressValue(event.target.value)}
                  required
                />
              </label>
              {error && <div className="alert alert-error text-xs">{error}</div>}
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save address
                </button>
              </div>
            </form>
          </div>
          <button className="modal-backdrop" onClick={closeModal} aria-label="Close" />
        </div>
      )}
    </div>
  );
}
