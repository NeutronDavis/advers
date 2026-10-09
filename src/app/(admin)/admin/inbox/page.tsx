"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Inbox, Search, Mail, UserCheck, ArrowRight, Sparkles, Filter } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminInboxPage() {
  const [filter, setFilter] = useState("ALL");

  const inquiries = [
    {
      id: "FB-101",
      name: "Olumide Adebayo",
      company: "Adebayo Holdings",
      email: "olumide@adebayoholdings.ng",
      phone: "+234 803 123 4567",
      packageInterest: "Look Professional (₦250k - ₦350k)",
      message: "Interested in setting up 3-5 page custom website and business email provisioning for our Lagos operations.",
      status: "NEW",
      date: "20 mins ago",
    },
    {
      id: "FB-102",
      name: "Chidi Nwosu",
      company: "Lekki Retail Hub",
      email: "chidi@lekkiretail.com",
      phone: "+234 802 987 6543",
      packageInterest: "LED Billboard Slot (Victoria Island)",
      message: "Looking for 4-week slot reservation on the Victoria Island digital screen.",
      status: "IN_REVIEW",
      date: "2 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 sm:p-8 space-y-6">
      <header className="flex justify-between items-center pb-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Advers Logo" className="h-8 w-auto" />
          <div>
            <h1 className="text-xl font-extrabold text-base-content tracking-tight">
              Advers Staff Backoffice
            </h1>
            <p className="text-xs text-base-content/60">Lead Inbox &amp; Client Qualification</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/portal/dashboard" className="btn btn-outline border-base-300 text-xs font-bold rounded-xl">
            Go to Client View
          </Link>
        </div>
      </header>

      {/* Main Inbox Dashboard */}
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" />
            <span>Lead &amp; Enquiry Inbox</span>
            <span className="badge badge-primary text-xs font-bold">2 New</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-base-content/60">Filter:</span>
            {["ALL", "NEW", "IN_REVIEW", "QUALIFIED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content/70 hover:bg-base-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {inquiries.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-3d space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary text-[10px] font-bold">{item.id}</span>
                  <h3 className="text-base font-extrabold text-base-content">{item.name}</h3>
                  <span className="text-xs text-base-content/60">({item.company})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/50">{item.date}</span>
                  <span className="badge badge-warning text-xs font-bold">{item.status}</span>
                </div>
              </div>

              <div className="text-xs font-bold text-primary">
                Interest: {item.packageInterest}
              </div>

              <p className="text-xs text-base-content/80 bg-base-200/50 p-3.5 rounded-2xl leading-relaxed">
                &ldquo;{item.message}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-base-content/60 font-medium">
                  Email: <span className="font-bold text-base-content">{item.email}</span> | Phone:{" "}
                  <span className="font-bold text-base-content">{item.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/accept-invite?token=${item.id}`}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border-none shadow-sm gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Send Account Invite</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
