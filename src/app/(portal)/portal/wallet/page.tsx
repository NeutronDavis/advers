"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Download,
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function WalletAndBillingPage() {
  const { showToast } = useCampaign();
  const [balance, setBalance] = useState(485000);
  const [escrowLocked, setEscrowLocked] = useState(225000);
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);

  const transactions = [
    {
      id: "tx-1092",
      type: "DEPOSIT",
      title: "Bank Card Deposit (Paystack)",
      date: "2026-10-25 14:22",
      amount: "+₦500,000",
      status: "COMPLETED",
    },
    {
      id: "tx-1091",
      type: "ESCROW_LOCK",
      title: "Summer Product Launch (DOOH Port Harcourt)",
      date: "2026-10-24 10:15",
      amount: "-₦150,000",
      status: "LOCKED_IN_ESCROW",
    },
    {
      id: "tx-1090",
      type: "ESCROW_LOCK",
      title: "Brand Awareness Drive (FM Radio Rivers)",
      date: "2026-10-26 16:40",
      amount: "-₦75,000",
      status: "LOCKED_IN_ESCROW",
    },
  ];

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(depositAmount);
    if (!val || val <= 0) return;

    setBalance((prev) => prev + val);
    setDepositAmount("");
    setShowDepositModal(false);
    showToast(`₦${val.toLocaleString("en-NG")} credited to your Advers wallet!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--portal-line)]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold-ink-strong)]">
            Naira Escrow & Billing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--portal-ink)] tracking-tight">
            Wallet & Payments
          </h1>
          <p className="text-xs sm:text-sm text-[var(--portal-muted)] mt-0.5">
            Manage your media wallet balance, campaign escrow reserves, and official tax invoices.
          </p>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="btn bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl px-5 text-xs font-black shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Top up wallet (₦)</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="card bg-[var(--portal-obsidian)] text-white rounded-3xl p-6 shadow-xl space-y-2">
          <div className="text-[10px] text-[var(--portal-gold-ink)] font-bold uppercase tracking-wider">
            Available Media Balance
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ₦{balance.toLocaleString("en-NG")}
          </div>
          <p className="text-[11px] text-[var(--portal-obsidian-muted-2)] pt-1">
            Ready for instant channel bookings and ad flight reservations.
          </p>
        </div>

        {/* Escrow Locked */}
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="text-[10px] text-[var(--portal-gold-ink)] font-bold uppercase tracking-wider">
            Locked in Campaign Escrow
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--portal-ink)]">
            ₦{escrowLocked.toLocaleString("en-NG")}
          </div>
          <p className="text-[11px] text-[var(--portal-muted)] pt-1">
            Released to media houses only after broadcast proof is confirmed.
          </p>
        </div>

        {/* Total Deployed */}
        <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="text-[10px] text-[var(--portal-success)] font-bold uppercase tracking-wider">
            Total Deployed Spend
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--portal-ink)]">
            ₦710,000
          </div>
          <p className="text-[11px] text-[var(--portal-muted)] pt-1">
            Accumulated campaign spend across active flights.
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card bg-[var(--portal-surface)] border border-[var(--portal-line)] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--portal-line-soft)]">
          <div>
            <h3 className="text-base font-bold text-[var(--portal-ink)]">
              Recent Financial Activity
            </h3>
            <p className="text-[11px] text-[var(--portal-muted)]">
              Audited wallet deposits, campaign reservations, and refunds.
            </p>
          </div>
          <button
            onClick={() => showToast("Downloading official statement PDF...")}
            className="btn btn-ghost btn-sm text-xs font-bold text-[var(--portal-gold-ink)] rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>

        <div className="divide-y divide-[var(--portal-line-soft)]">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-[var(--portal-surface-muted)] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    tx.type === "DEPOSIT"
                      ? "bg-[var(--portal-success-soft)] text-[var(--portal-success-strong)]"
                      : "bg-[var(--portal-warning-soft)] text-[var(--portal-gold-ink)]"
                  }`}
                >
                  {tx.type === "DEPOSIT" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--portal-ink)]">
                    {tx.title}
                  </div>
                  <div className="text-[10px] text-[var(--portal-muted)] mt-0.5">
                    {tx.id} · {tx.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-black ${
                    tx.type === "DEPOSIT" ? "text-[var(--portal-success-strong)]" : "text-[var(--portal-ink)]"
                  }`}
                >
                  {tx.amount}
                </div>
                <div className="text-[10px] text-[var(--portal-muted)] mt-0.5">
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top up Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="card bg-[var(--portal-surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--portal-line)] space-y-4">
            <h3 className="text-lg font-black text-[var(--portal-ink)]">
              Top up Advertising Wallet
            </h3>
            <p className="text-xs text-[var(--portal-muted)]">
              Enter the amount in Nigerian Naira (₦). You will be credited immediately upon confirmation.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--portal-ink)]">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  required
                  placeholder="e.g. 100000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input input-bordered w-full text-sm rounded-xl"
                />
              </div>

              <div className="p-3 bg-[var(--portal-soft)] rounded-xl flex items-center gap-2 text-xs text-[var(--portal-muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--portal-success)] shrink-0" />
                <span>Secured with Paystack & Flutterwave bank-grade escrow.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="btn btn-ghost btn-sm text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-[var(--portal-obsidian)] hover:bg-black text-white rounded-xl text-xs font-bold px-4"
                >
                  Confirm & Credit Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

