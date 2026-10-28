"use client";

import React, { useState } from "react";
import {
  Receipt,
  Download,
  Building,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function AdminFinanceAndSettlementsPage() {
  const settlements = [
    {
      id: "SET-402",
      vendor: "Elevate Media Network (DOOH Screen #1)",
      campaign: "Summer Product Launch",
      amountOwed: "₦110,000",
      adversFee: "₦40,000",
      status: "READY_FOR_PAYOUT",
    },
    {
      id: "SET-401",
      vendor: "AIM Group (Cool FM / Nigeria Info)",
      campaign: "Brand Awareness Drive",
      amountOwed: "₦55,000",
      adversFee: "₦20,000",
      status: "READY_FOR_PAYOUT",
    },
    {
      id: "SET-400",
      vendor: "Punch Nigeria Limited",
      campaign: "Legal Public Notice Publication",
      amountOwed: "₦240,000",
      adversFee: "₦80,000",
      status: "SETTLED",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Financial Clearinghouse
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Escrow & Media Vendor Settlements
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Audit client gross inflows, escrow holds, media house payables, and Advers gross margins.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading Financial Audit CSV...")}
          className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* 4 Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Gross Inflow (Month)
          </div>
          <div className="text-2xl font-black text-base-content tracking-tight mt-1.5 font-mono">
            ₦18,450,000
          </div>
          <div className="text-[11px] text-success font-bold mt-1">
            +24.5% month-on-month
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Escrow Holds (Live Flights)
          </div>
          <div className="text-2xl font-black text-warning tracking-tight mt-1.5 font-mono">
            ₦4,850,000
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            Pending PoP verification
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Media Vendor Payables
          </div>
          <div className="text-2xl font-black text-base-content tracking-tight mt-1.5 font-mono">
            ₦9,120,000
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            Payable upon PoP clearance
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="text-[10px] text-base-content/60 font-bold uppercase">
            Advers Agency Gross Margin
          </div>
          <div className="text-2xl font-black text-primary tracking-tight mt-1.5 font-mono">
            ₦4,480,000
          </div>
          <div className="text-[11px] text-primary font-bold mt-1">
            24.2% average net take rate
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-base-200">
          <div>
            <h3 className="text-base font-bold text-base-content">
              Media Partner Disbursements Queue
            </h3>
            <p className="text-xs text-base-content/60">
              Approved transmission invoices ready for wire transfer to station accounts.
            </p>
          </div>
          <span className="badge badge-success badge-sm font-bold">
            Escrow Backed
          </span>
        </div>

        <table className="table table-sm w-full">
          <thead>
            <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
              <th>Settlement ID</th>
              <th>Media Vendor / Station</th>
              <th>Campaign</th>
              <th>Vendor Net Payout</th>
              <th>Advers Fee Retained</th>
              <th>Settlement Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {settlements.map((set) => (
              <tr key={set.id} className="hover:bg-base-200/50 transition-colors">
                <td className="font-mono font-bold text-primary">{set.id}</td>
                <td className="font-bold text-base-content">{set.vendor}</td>
                <td className="text-base-content/80">{set.campaign}</td>
                <td className="font-mono font-black text-base-content">{set.amountOwed}</td>
                <td className="font-mono font-bold text-success">{set.adversFee}</td>
                <td>
                  <span
                    className={`badge badge-xs font-bold ${
                      set.status === "SETTLED"
                        ? "badge-success badge-soft"
                        : "badge-warning badge-soft"
                    }`}
                  >
                    {set.status}
                  </span>
                </td>
                <td className="text-right">
                  <button className="btn btn-xs btn-primary rounded-lg font-bold">
                    Process Payout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

