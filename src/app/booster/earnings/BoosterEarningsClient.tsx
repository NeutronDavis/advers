"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDownLeft,
  CheckCircle2,
  Coins,
  CreditCard,
  Wallet,
} from "lucide-react";
import { formatDate, formatNaira } from "@/lib/format";
import { requestWithdrawalAction } from "@/server/actions/finance";
import type { BoosterFinanceData } from "@/server/data/finance";

export default function BoosterEarningsClient({
  data,
}: {
  data: BoosterFinanceData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [accountDetails, setAccountDetails] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await requestWithdrawalAction({
        amount: Number(amount || 0),
        method,
        accountDetails,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotice("Withdrawal request submitted for finance review.");
      setAmount("");
      setAccountDetails("");
      router.refresh();
    });
  };

  const totals = [
    {
      label: "Pending earnings",
      value: data.totals.pending,
      icon: <Coins className="w-4 h-4" />,
    },
    {
      label: "Approved earnings",
      value: data.totals.approved,
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: "Paid earnings",
      value: data.totals.paid,
      icon: <ArrowDownLeft className="w-4 h-4" />,
    },
    {
      label: "Withdrawable",
      value: data.totals.withdrawable,
      icon: <Wallet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Booster earnings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Earnings &amp; withdrawals
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Pending, approved and paid earnings are tracked separately. Withdrawals
            require finance approval.
          </p>
        </div>
        <span className="badge badge-lg badge-primary badge-soft font-bold self-start sm:self-auto">
          {data.displayName}
        </span>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {totals.map((total) => (
          <div
            key={total.label}
            className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-base-content/60 text-[10px] font-bold uppercase">
              <span>{total.label}</span>
              <div className="w-7 h-7 rounded-lg bg-base-200 flex items-center justify-center">
                {total.icon}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono mt-2">
              {formatNaira(total.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold">Earnings history</h2>
              <p className="text-xs text-base-content/60">
                Each approved deliverable creates an earning.
              </p>
            </div>

            {data.earnings.length === 0 ? (
              <div className="py-10 text-center text-xs text-base-content/60">
                No earnings yet. Complete an assigned job and submit proof.
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {data.earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold">{earning.jobTitle}</div>
                      <div className="text-[10px] text-base-content/50 font-mono">
                        {earning.jobNumber} · {earning.paymentModel} ·{" "}
                        {formatDate(earning.createdAt)}
                      </div>
                      {earning.paidAmount > 0 && (
                        <div className="text-[9px] text-base-content/50">
                          Paid so far: {formatNaira(earning.paidAmount)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm">
                        {formatNaira(earning.amount)}
                      </span>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold">Withdrawal history</h2>
              <p className="text-xs text-base-content/60">
                Withdrawals are reviewed by Advers finance before payout.
              </p>
            </div>

            {data.withdrawals.length === 0 ? (
              <div className="py-10 text-center text-xs text-base-content/60">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {data.withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold">
                        {formatNaira(withdrawal.amount)}
                      </div>
                      <div className="text-[10px] text-base-content/50 font-mono">
                        {withdrawal.reference} · {withdrawal.method} ·{" "}
                        {formatDate(withdrawal.requestedAt)}
                      </div>
                      {withdrawal.notes && (
                        <div className="text-[10px] text-base-content/60 mt-1">
                          {withdrawal.notes}
                        </div>
                      )}
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={submit}
            className="card bg-base-100 border border-primary/20 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Request withdrawal
              </h2>
              <p className="text-[11px] text-base-content/60">
                Withdrawable balance:{" "}
                <span className="font-bold text-base-content">
                  {formatNaira(data.totals.withdrawable)}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="withdraw-amount" className="text-xs font-bold">
                Amount (₦) *
              </label>
              <input
                id="withdraw-amount"
                type="number"
                min="1"
                max={data.totals.withdrawable}
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="input input-bordered w-full text-sm rounded-xl bg-base-200/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="withdraw-method" className="text-xs font-bold">
                Method
              </label>
              <select
                id="withdraw-method"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="select select-bordered w-full text-sm rounded-xl bg-base-200/50"
              >
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="PAYSTACK">Paystack transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="withdraw-account" className="text-xs font-bold">
                Payout details (private)
              </label>
              <textarea
                id="withdraw-account"
                rows={3}
                value={accountDetails}
                onChange={(event) => setAccountDetails(event.target.value)}
                placeholder="Bank name, account name and account number"
                className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || data.totals.withdrawable <= 0}
              className="btn btn-primary rounded-xl font-bold w-full gap-2"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Submit withdrawal request
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-base-200/50 text-[11px] text-base-content/60">
            Earnings become withdrawable after Advers approves your deliverable.
            Withdrawals are not paid automatically; finance reviews each request.
          </div>
        </div>
      </div>
    </div>
  );
}
