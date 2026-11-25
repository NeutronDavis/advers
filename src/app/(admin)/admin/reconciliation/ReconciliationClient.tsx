"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldOff,
  Wallet,
} from "lucide-react";
import { formatMoney, fromMoneyDTO } from "@/lib/money";
import { formatDate } from "@/lib/format";
import type { ReconciliationData } from "@/server/data/reconciliation";
import {
  ignoreProviderEventAction,
  resolveAdvertiserWithdrawalAction,
  retryProviderEventAction,
  setWalletStatusAction,
} from "@/server/actions/reconciliation";

type Tab = "EVENTS" | "WITHDRAWALS" | "FUNDING" | "WALLETS";
type ActionResult = { success: true } | { success: false; error: string };

function fmt(dto: { amountMinor: string; currency: "NGN" | "USDC" }) {
  return formatMoney(fromMoneyDTO({ amountMinor: dto.amountMinor, currency: dto.currency }));
}

function eventBadge(status: string): string {
  if (status === "PROCESSED") return "badge badge-success badge-sm";
  if (status === "FAILED") return "badge badge-error badge-sm";
  if (status === "IGNORED") return "badge badge-ghost badge-sm";
  return "badge badge-warning badge-sm";
}

function withdrawalBadge(status: string): string {
  if (status === "PAID") return "badge badge-success badge-sm";
  if (status === "FAILED") return "badge badge-error badge-sm";
  if (status === "PROCESSING" || status === "REQUESTED") {
    return "badge badge-warning badge-sm";
  }
  return "badge badge-ghost badge-sm";
}

export default function ReconciliationClient({ data }: { data: ReconciliationData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("EVENTS");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = (action: () => Promise<ActionResult>, message: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice(message);
      router.refresh();
    });
  };

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "EVENTS", label: "Provider events", count: data.providerEvents.length },
    { key: "WITHDRAWALS", label: "Advertiser withdrawals", count: data.withdrawals.length },
    { key: "FUNDING", label: "Pending funding", count: data.pendingFunding.length },
    { key: "WALLETS", label: "Wallets", count: data.wallets.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-base-200 pb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary">
          Payment operations
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Reconciliation &amp; Wallet Controls
        </h1>
        <p className="mt-0.5 text-xs text-base-content/70 sm:text-sm">
          Retry provider events, resolve stuck withdrawals, and freeze wallets.
        </p>
      </div>

      {error && (
        <div className="alert alert-error text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            label: "Failed events",
            value: data.totals.failedEvents,
            icon: <AlertTriangle className="h-4 w-4" />,
          },
          {
            label: "Unprocessed events",
            value: data.totals.pendingEvents,
            icon: <Clock className="h-4 w-4" />,
          },
          {
            label: "Open withdrawals",
            value: data.totals.processingWithdrawals,
            icon: <ArrowUpRight className="h-4 w-4" />,
          },
          {
            label: "Pending funding",
            value: data.totals.pendingFunding,
            icon: <Wallet className="h-4 w-4" />,
          },
          {
            label: "Restricted wallets",
            value: data.totals.frozenWallets,
            icon: <ShieldOff className="h-4 w-4" />,
          },
        ].map((item) => (
          <div key={item.label} className="card border border-base-200 bg-base-100 p-4 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-base-content/60">
              <span>{item.label}</span>
              <span className="text-primary">{item.icon}</span>
            </div>
            <div className="mt-2 text-2xl font-black">{item.value}</div>
          </div>
        ))}
      </div>

      <div role="tablist" className="tabs tabs-border">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            className={`tab gap-2 ${tab === item.key ? "tab-active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <span className="badge badge-ghost badge-xs">{item.count}</span>
          </button>
        ))}
      </div>

      {tab === "EVENTS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Error</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.providerEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-base-content/60">
                      No provider events yet.
                    </td>
                  </tr>
                )}
                {data.providerEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="text-xs font-bold">{event.type}</div>
                      <div className="font-mono text-[10px] text-base-content/60">
                        {event.eventId}
                      </div>
                      <div className="text-[10px] text-base-content/50">
                        {formatDate(event.createdAt)}
                      </div>
                    </td>
                    <td className="text-xs">{event.provider}</td>
                    <td>
                      <span className={eventBadge(event.status)}>{event.status}</span>
                    </td>
                    <td className="text-xs">{event.attempts}</td>
                    <td className="max-w-[260px] text-[10px] text-error">
                      {event.error ?? "—"}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {event.status !== "PROCESSED" && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () => retryProviderEventAction(event.id),
                                "Provider event retried."
                              )
                            }
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                        )}
                        {event.status !== "PROCESSED" && event.status !== "IGNORED" && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-base-content/60"
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () => ignoreProviderEventAction(event.id),
                                "Provider event ignored."
                              )
                            }
                          >
                            Ignore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "WITHDRAWALS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Provider ref</th>
                  <th className="text-right">Resolve</th>
                </tr>
              </thead>
              <tbody>
                {data.withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-base-content/60">
                      No advertiser withdrawals yet.
                    </td>
                  </tr>
                )}
                {data.withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td>
                      <div className="text-xs font-bold">{withdrawal.userName}</div>
                      <div className="text-[10px] text-base-content/60">
                        {withdrawal.userEmail}
                      </div>
                    </td>
                    <td className="text-xs font-black">{fmt(withdrawal.amountMoney)}</td>
                    <td className="text-xs">
                      {withdrawal.destinationLabel ?? "—"}
                      <div className="font-mono text-[10px] text-base-content/50">
                        {withdrawal.network}
                      </div>
                    </td>
                    <td>
                      <span className={withdrawalBadge(withdrawal.status)}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate font-mono text-[10px] text-base-content/60">
                      {withdrawal.providerReference ?? "—"}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {withdrawal.status !== "PAID" && withdrawal.status !== "FAILED" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-xs"
                              disabled={isPending || !withdrawal.providerReference}
                              title={
                                withdrawal.providerReference
                                  ? "Mark as paid"
                                  : "No provider reference"
                              }
                              onClick={() =>
                                run(
                                  () =>
                                    resolveAdvertiserWithdrawalAction({
                                      withdrawalId: withdrawal.id,
                                      decision: "PAID",
                                    }),
                                  "Withdrawal marked paid."
                                )
                              }
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              className="btn btn-error btn-xs"
                              disabled={isPending}
                              onClick={() =>
                                run(
                                  () =>
                                    resolveAdvertiserWithdrawalAction({
                                      withdrawalId: withdrawal.id,
                                      decision: "FAILED",
                                      notes: "Returned by finance resolution.",
                                    }),
                                  "Withdrawal failed and funds returned."
                                )
                              }
                            >
                              Fail &amp; refund
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "FUNDING" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingFunding.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-base-content/60">
                      No pending funding requests.
                    </td>
                  </tr>
                )}
                {data.pendingFunding.map((funding) => (
                  <tr key={funding.id}>
                    <td>
                      <div className="text-xs font-bold">{funding.userName}</div>
                      <div className="text-[10px] text-base-content/60">
                        {funding.userEmail}
                      </div>
                    </td>
                    <td className="text-xs font-black">{fmt(funding.amountMoney)}</td>
                    <td className="font-mono text-[10px]">{funding.reference}</td>
                    <td>
                      <span className="badge badge-warning badge-sm">{funding.status}</span>
                    </td>
                    <td className="text-[11px] text-base-content/60">
                      {formatDate(funding.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "WALLETS" && (
        <section className="card border border-base-200 bg-base-100 p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Currency</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-right">Controls</th>
                </tr>
              </thead>
              <tbody>
                {data.wallets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-base-content/60">
                      No wallets found.
                    </td>
                  </tr>
                )}
                {data.wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>
                      <div className="text-xs font-bold">{wallet.userName}</div>
                      <div className="text-[10px] text-base-content/60">
                        {wallet.userEmail}
                      </div>
                    </td>
                    <td className="text-xs">
                      {wallet.currency}
                      <div className="text-[10px] text-base-content/50">{wallet.network}</div>
                    </td>
                    <td className="text-xs font-black">{fmt(wallet.balanceMoney)}</td>
                    <td>
                      <span
                        className={
                          wallet.status === "ACTIVE"
                            ? "badge badge-success badge-sm"
                            : "badge badge-error badge-sm"
                        }
                      >
                        {wallet.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {wallet.status !== "ACTIVE" && (
                          <button
                            type="button"
                            className="btn btn-success btn-xs"
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () =>
                                  setWalletStatusAction({
                                    walletId: wallet.id,
                                    status: "ACTIVE",
                                  }),
                                "Wallet reactivated."
                              )
                            }
                          >
                            Activate
                          </button>
                        )}
                        {wallet.status === "ACTIVE" && (
                          <button
                            type="button"
                            className="btn btn-warning btn-xs"
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () =>
                                  setWalletStatusAction({
                                    walletId: wallet.id,
                                    status: "FROZEN",
                                  }),
                                "Wallet frozen."
                              )
                            }
                          >
                            Freeze
                          </button>
                        )}
                        {wallet.status !== "CLOSED" && (
                          <button
                            type="button"
                            className="btn btn-error btn-xs"
                            disabled={isPending}
                            onClick={() =>
                              run(
                                () =>
                                  setWalletStatusAction({
                                    walletId: wallet.id,
                                    status: "CLOSED",
                                  }),
                                "Wallet closed."
                              )
                            }
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
