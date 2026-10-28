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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Naira Escrow & Billing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            Wallet & Payments
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Manage your media wallet balance, campaign escrow reserves, and official tax invoices.
          </p>
        </div>

        <button
          onClick={() => setShowDepositModal(true)}
          className="btn bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] border-none rounded-xl px-5 text-xs font-black shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Top up wallet (₦)</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="card bg-[#101113] text-white rounded-3xl p-6 shadow-xl space-y-2">
          <div className="text-[10px] text-[#f7d98a] font-bold uppercase tracking-wider">
            Available Media Balance
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ₦{balance.toLocaleString("en-NG")}
          </div>
          <p className="text-[11px] text-[#bfc0c5] pt-1">
            Ready for instant channel bookings and ad flight reservations.
          </p>
        </div>

        {/* Escrow Locked */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="text-[10px] text-[#8b6416] font-bold uppercase tracking-wider">
            Locked in Campaign Escrow
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#15171b]">
            ₦{escrowLocked.toLocaleString("en-NG")}
          </div>
          <p className="text-[11px] text-[#7c818b] pt-1">
            Released to media houses only after broadcast proof is confirmed.
          </p>
        </div>

        {/* Total Deployed */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="text-[10px] text-[#16845b] font-bold uppercase tracking-wider">
            Total Deployed Spend
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#15171b]">
            ₦710,000
          </div>
          <p className="text-[11px] text-[#7c818b] pt-1">
            Accumulated campaign spend across active flights.
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f2]">
          <div>
            <h3 className="text-base font-bold text-[#15171b]">
              Recent Financial Activity
            </h3>
            <p className="text-[11px] text-[#7c818b]">
              Audited wallet deposits, campaign reservations, and refunds.
            </p>
          </div>
          <button
            onClick={() => showToast("Downloading official statement PDF...")}
            className="btn btn-ghost btn-sm text-xs font-bold text-[#80601f] rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>

        <div className="divide-y divide-[#f0f0f2]">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafb] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    tx.type === "DEPOSIT"
                      ? "bg-[#e4f6ec] text-[#19764b]"
                      : "bg-[#fff1d2] text-[#8b6416]"
                  }`}
                >
                  {tx.type === "DEPOSIT" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#15171b]">
                    {tx.title}
                  </div>
                  <div className="text-[10px] text-[#7c818b] mt-0.5">
                    {tx.id} · {tx.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-black ${
                    tx.type === "DEPOSIT" ? "text-[#19764b]" : "text-[#15171b]"
                  }`}
                >
                  {tx.amount}
                </div>
                <div className="text-[10px] text-[#7c818b] mt-0.5">
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
          <div className="card bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e8e9ed] space-y-4">
            <h3 className="text-lg font-black text-[#15171b]">
              Top up Advertising Wallet
            </h3>
            <p className="text-xs text-[#7c818b]">
              Enter the amount in Nigerian Naira (₦). You will be credited immediately upon confirmation.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#15171b]">
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

              <div className="p-3 bg-[#f8f9fa] rounded-xl flex items-center gap-2 text-xs text-[#7c818b]">
                <ShieldCheck className="w-4 h-4 text-[#16845b] shrink-0" />
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
                  className="btn btn-sm bg-[#101113] hover:bg-black text-white rounded-xl text-xs font-bold px-4"
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

