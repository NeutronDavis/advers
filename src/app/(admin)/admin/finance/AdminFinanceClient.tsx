"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Download,
  Receipt,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import {
  resolveDisputeAction,
  reviewWithdrawalAction,
} from "@/server/actions/finance";
import type { AdminFinanceData } from "@/server/data/finance";

type ActionResult = { success: true } | { success: false; error: string };

type Tab = "LEDGER" | "EARNINGS" | "WITHDRAWALS" | "DISPUTES";

export default function AdminFinanceClient({ data }: { data: AdminFinanceData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("LEDGER");

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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "LEDGER", label: "Ledger", count: data.ledger.length },
    { key: "EARNINGS", label: "Booster earnings", count: data.earnings.length },
    { key: "WITHDRAWALS", label: "Withdrawals", count: data.withdrawals.length },
    { key: "DISPUTES", label: "Disputes", count: data.disputes.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Financial clearinghouse
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Payments, Earnings &amp; Disputes
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Audit subscription revenue, campaign funds, Booster earnings,
            withdrawals, fees and disputes.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setNotice("Ledger export will be connected to the finance export job.")
          }
          className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export ledger
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-xs rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success text-xs rounded-2xl">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            label: "Gross inflow",
            value: formatNaira(data.totals.grossInflow),
            icon: <ArrowDownLeft className="w-4 h-4" />,
          },
          {
            label: "Escrow held",
            value: formatNaira(data.totals.escrowHeld),
            icon: <ShieldCheck className="w-4 h-4" />,
          },
          {
            label: "Booster payable",
            value: formatNaira(data.totals.boosterPayable),
            icon: <Coins className="w-4 h-4" />,
          },
          {
            label: "Advers fees",
            value: formatNaira(data.totals.adversFees),
            icon: <Receipt className="w-4 h-4" />,
          },
          {
            label: "Pending withdrawals",
            value: formatNaira(data.totals.pendingWithdrawals),
            icon: <Wallet className="w-4 h-4" />,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card bg-base-100 border border-base-200 rounded-2xl p-4 shadow-xs"
          >
            <div className="flex items-center justify-between text-base-content/60 text-[10px] font-bold uppercase">
              <span>{kpi.label}</span>
              <div className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black font-mono mt-2">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold ${
              tab === item.key ? "btn-primary" : "btn-ghost border border-base-300"
            }`}
          >
            {item.label}
            <span className="badge badge-xs">{item.count}</span>
          </button>
        ))}
      </div>

      {tab === "LEDGER" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h2 className="text-base font-bold">Unified ledger</h2>
              <p className="text-xs text-base-content/60">
                Subscription, campaign, Booster, commission and withdrawal records.
              </p>
            </div>
            <span className="badge badge-primary badge-sm font-bold">
              {data.ledger.length} entries
            </span>
          </div>

          {data.ledger.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No ledger entries yet.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                  <th>Type / Status</th>
                  <th>Reference</th>
                  <th>Related</th>
                  <th>Gross</th>
                  <th>Fee</th>
                  <th>Net</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {data.ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-base-200/50">
                    <td>
                      <div className="font-bold text-base-content">
                        {entry.type.replace(/_/g, " ")}
                      </div>
                      <span
                        className={`badge badge-xs font-bold ${
                          entry.status === "PAID" || entry.status === "RELEASED"
                            ? "badge-success badge-soft"
                            : entry.status === "HELD"
                              ? "badge-warning badge-soft"
                              : "badge-ghost"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="font-mono text-[10px] text-base-content/60">
                      {entry.reference}
                    </td>
                    <td className="text-base-content/70">
                      {entry.campaignName || entry.jobTitle || entry.boosterName || "—"}
                    </td>
                    <td className="font-mono font-bold">
                      {formatNaira(entry.grossAmount)}
                    </td>
                    <td className="font-mono text-success">
                      {formatNaira(entry.feeAmount)}
                    </td>
                    <td className="font-mono font-black">
                      {formatNaira(entry.netAmount)}
                    </td>
                    <td className="text-base-content/60">
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "EARNINGS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
          <div>
            <h2 className="text-base font-bold">Booster earnings</h2>
            <p className="text-xs text-base-content/60">
              Approved deliverables create an earning. Withdrawals move approved
              earnings to paid.
            </p>
          </div>

          {data.earnings.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No Booster earnings yet.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                  <th>Booster</th>
                  <th>Job</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {data.earnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-base-200/50">
                    <td className="font-bold">{earning.boosterName}</td>
                    <td className="text-base-content/70">{earning.jobTitle}</td>
                    <td className="font-mono font-black">
                      {formatNaira(earning.amount)}
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs font-bold ${
                          earning.status === "PAID"
                            ? "badge-success badge-soft"
                            : earning.status === "APPROVED"
                              ? "badge-info badge-soft"
                              : "badge-warning badge-soft"
                        }`}
                      >
                        {earning.status}
                      </span>
                    </td>
                    <td className="text-base-content/60">
                      {formatDate(earning.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "WITHDRAWALS" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
          <div>
            <h2 className="text-base font-bold">Withdrawal requests</h2>
            <p className="text-xs text-base-content/60">
              Approve, reject or mark a withdrawal paid. Earnings are marked paid
              when the withdrawal is completed.
            </p>
          </div>

          {data.withdrawals.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No withdrawal requests yet.
            </div>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
                  <th>Booster</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {data.withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-base-200/50">
                    <td>
                      <div className="font-bold">{withdrawal.boosterName}</div>
                      <div className="text-[10px] font-mono text-base-content/50">
                        {withdrawal.reference}
                      </div>
                    </td>
                    <td className="font-mono font-black">
                      {formatNaira(withdrawal.amount)}
                    </td>
                    <td className="text-base-content/70">
                      {withdrawal.method}
                      {withdrawal.accountDetails && (
                        <div className="text-[9px] text-base-content/50">
                          {withdrawal.accountDetails}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs font-bold ${
                          withdrawal.status === "PAID"
                            ? "badge-success badge-soft"
                            : withdrawal.status === "REJECTED"
                              ? "badge-error badge-soft"
                              : "badge-warning badge-soft"
                        }`}
                      >
                        {withdrawal.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="text-base-content/60">
                      {formatDate(withdrawal.requestedAt)}
                    </td>
                    <td className="text-right">
                      {["REQUESTED", "UNDER_REVIEW", "APPROVED"].includes(
                        withdrawal.status
                      ) && (
                        <div className="flex items-center justify-end gap-1">
                          {withdrawal.status !== "PAID" && (
                            <button
                              type="button"
                              onClick={() =>
                                run(
                                  () =>
                                    reviewWithdrawalAction({
                                      withdrawalId: withdrawal.id,
                                      decision: "PAID",
                                    }),
                                  "Withdrawal marked paid."
                                )
                              }
                              disabled={isPending}
                              className="btn btn-xs btn-primary rounded-lg font-bold"
                            >
                              Mark paid
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const notes = window.prompt(
                                "Reason for rejecting this withdrawal:"
                              );
                              if (!notes) return;
                              run(
                                () =>
                                  reviewWithdrawalAction({
                                    withdrawalId: withdrawal.id,
                                    decision: "REJECTED",
                                    notes,
                                  }),
                                "Withdrawal rejected."
                              );
                            }}
                            disabled={isPending}
                            className="btn btn-xs btn-ghost text-error rounded-lg font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "DISPUTES" && (
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold">Disputes</h2>
            <p className="text-xs text-base-content/60">
              Review evidence, update status and record a resolution.
            </p>
          </div>

          {data.disputes.length === 0 ? (
            <div className="py-12 text-center text-xs text-base-content/60">
              No disputes.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {data.disputes.map((dispute) => (
                <div key={dispute.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge badge-xs font-bold ${
                        dispute.status === "OPEN"
                          ? "badge-error badge-soft"
                          : dispute.status === "RESOLVED"
                            ? "badge-success badge-soft"
                            : "badge-warning badge-soft"
                      }`}
                    >
                      {dispute.status}
                    </span>
                    <span className="text-xs font-bold">
                      {dispute.jobTitle || dispute.campaignName || "Dispute"}
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      Opened by {dispute.openedByName} ·{" "}
                      {formatDate(dispute.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70">{dispute.reason}</p>
                  {dispute.againstBoosterName && (
                    <div className="text-[10px] text-base-content/50">
                      Against Booster: {dispute.againstBoosterName}
                    </div>
                  )}
                  {dispute.resolution && (
                    <div className="p-2 rounded-lg bg-base-200/50 text-[11px]">
                      Resolution: {dispute.resolution}
                    </div>
                  )}
                  {dispute.status !== "CLOSED" && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          run(
                            () =>
                              resolveDisputeAction({
                                disputeId: dispute.id,
                                status: "UNDER_REVIEW",
                              }),
                            "Dispute moved under review."
                          )
                        }
                        disabled={isPending}
                        className="btn btn-xs btn-ghost border border-base-300 rounded-lg font-bold"
                      >
                        Under review
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const resolution = window.prompt(
                            "Describe the resolution:"
                          );
                          if (!resolution) return;
                          run(
                            () =>
                              resolveDisputeAction({
                                disputeId: dispute.id,
                                status: "RESOLVED",
                                resolution,
                              }),
                            "Dispute resolved."
                          );
                        }}
                        disabled={isPending}
                        className="btn btn-xs btn-primary rounded-lg font-bold"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          run(
                            () =>
                              resolveDisputeAction({
                                disputeId: dispute.id,
                                status: "CLOSED",
                              }),
                            "Dispute closed."
                          )
                        }
                        disabled={isPending}
                        className="btn btn-xs btn-ghost rounded-lg font-bold"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
