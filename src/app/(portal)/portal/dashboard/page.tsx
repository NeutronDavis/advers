"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Globe,
  Plus,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function ClientDashboardPage() {
  const engagement = {
    packageName: "Look Professional Tier",
    status: "ONBOARDING_COMPLETED",
    progress: 75,
    assignedManager: "Amaka Nnaji",
    nextMilestone: "Sitemap & Wireframe Approval",
    dueDate: "Tomorrow, 4:00 PM",
  };

  const milestones = [
    { title: "Deposit Payment & Onboarding Setup", status: "completed", date: "Oct 8" },
    { title: "Domain & Business Email Provisioning", status: "completed", date: "Oct 9" },
    { title: "Brand Identity & Sitemap Wireframe", status: "in-progress", date: "Oct 12" },
    { title: "Final Review & Live Handover", status: "upcoming", date: "Oct 15" },
  ];

  return (
    <div className="space-y-6 animate-entrance">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-[#4f46e5] to-[#712ae2] text-white rounded-3xl p-6 sm:p-8 shadow-3d relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome, Olumide! 👋
              </h1>
              <p className="text-xs sm:text-sm text-white/85 font-medium mt-1">
                Your <span className="font-bold underline">{engagement.packageName}</span> is currently in production.
              </p>
            </div>

            <Link
              href="/portal/onboarding/eng-101"
              className="bg-white text-[#3525cd] hover:bg-slate-100 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>View Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Onboarding Progress Bar */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-white/90">
              <span>Overall Progress</span>
              <span>{engagement.progress}%</span>
            </div>
            <progress
              className="progress progress-warning w-full h-3 rounded-full bg-white/20"
              value={engagement.progress}
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-sm space-y-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-bold text-base-content/60 uppercase tracking-wider">Package Tier</div>
          <div className="text-xs sm:text-base lg:text-lg font-extrabold text-primary leading-tight break-words">Look Professional</div>
          <div className="text-[10px] text-emerald-600 font-bold">Verified Client</div>
        </div>

        <div className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-sm space-y-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-bold text-base-content/60 uppercase tracking-wider">Domain Status</div>
          <div className="text-xs sm:text-base lg:text-lg font-extrabold text-base-content truncate leading-tight" title="adebayoholdings.ng">adebayoholdings.ng</div>
          <div className="text-[10px] text-emerald-600 font-bold">Provisioned</div>
        </div>

        <div className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-sm space-y-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-bold text-base-content/60 uppercase tracking-wider">Dedicated Lead</div>
          <div className="text-xs sm:text-base lg:text-lg font-extrabold text-base-content leading-tight truncate">{engagement.assignedManager}</div>
          <div className="text-[10px] text-base-content/50 font-bold">Operations Lead</div>
        </div>

        <div className="bg-base-100 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-base-200 shadow-sm space-y-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-bold text-base-content/60 uppercase tracking-wider">Care Plan</div>
          <div className="text-xs sm:text-base lg:text-lg font-extrabold text-emerald-600 leading-tight">Active (Year 1)</div>
          <div className="text-[10px] text-base-content/50 font-bold">24/7 Monitoring</div>
        </div>
      </div>

      {/* Main Grid: Left Column Milestones, Right Column Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 7): Milestone Timeline */}
        <div className="lg:col-span-7 bg-base-100 rounded-3xl p-6 border border-base-200 shadow-3d space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-base-content">Production Milestones</h3>
            <span className="badge badge-primary text-xs font-bold">2 Rounds Revision</span>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-200"
              >
                <div className="flex items-center gap-3">
                  {m.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : m.status === "in-progress" ? (
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-base-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      m.status === "completed"
                        ? "text-base-content line-through opacity-70"
                        : m.status === "in-progress"
                        ? "text-primary font-bold"
                        : "text-base-content/60"
                    }`}
                  >
                    {m.title}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-base-content/50 shrink-0">
                  {m.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Span 5): Recommended Next Services */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-3d space-y-4">
            <h3 className="text-lg font-extrabold text-base-content">Recommended Next Step</h3>
            <p className="text-xs text-base-content/75 leading-relaxed">
              Expand your physical reach alongside your digital package by booking high-impact roadside LED billboards in Ikeja &amp; Victoria Island.
            </p>

            <Link
              href="/#placements"
              className="btn btn-outline border-base-300 text-xs font-bold rounded-xl w-full flex items-center justify-between"
            >
              <span>Explore Billboard Screens</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-base-200/60 rounded-3xl p-6 border border-base-300 space-y-3">
            <div className="text-xs font-bold text-base-content uppercase">Need Help?</div>
            <p className="text-xs text-base-content/75">
              Chat directly with your manager on WhatsApp for immediate feedback on designs.
            </p>
            <a
              href="https://wa.me/234800ADVERS"
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl w-full border-none shadow-md"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
