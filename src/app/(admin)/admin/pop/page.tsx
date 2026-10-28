"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Camera,
  Upload,
  CheckCircle2,
  Calendar,
  Eye,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ProofOfPerformanceDeskPage() {
  const [notice, setNotice] = useState<string | null>(null);

  const popRecords = [
    {
      id: "POP-901",
      campaign: "Summer Product Launch",
      client: "Adebayo Holdings",
      channel: "DOOH (Port Harcourt GRA)",
      type: "Geotagged Photo & 15s Video",
      dateRecorded: "2026-10-26 14:10",
      verifiedBy: "Samuel (Field Agent #3)",
      status: "VERIFIED",
    },
    {
      id: "POP-902",
      campaign: "Brand Awareness Drive",
      client: "Zinox Retail Store",
      channel: "FM Radio (Cool FM Lagos)",
      type: "Signed Station Broadcast Affidavit",
      dateRecorded: "2026-10-26 08:30",
      verifiedBy: "Station Traffic Manager",
      status: "VERIFIED",
    },
    {
      id: "POP-903",
      campaign: "Lekki Toll Mega Display",
      client: "Swift Telecom",
      channel: "DOOH (Lekki Phase 1 Screen)",
      type: "Night-time Loop Playback Footage",
      dateRecorded: "2026-10-25 21:45",
      verifiedBy: "Lagos Ops Field Patrol",
      status: "VERIFIED",
    },
  ];

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Proof of performance asset uploaded and synced to client dashboard!");
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Notice */}
      {notice && (
        <div className="alert alert-success shadow-lg text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Verification & Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Proof of Performance (PoP) Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Ingest and verify billboard photos, radio certificates of broadcast, and newspaper tearsheets.
          </p>
        </div>
      </div>

      {/* Two Column: Upload Form & Verified Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="card bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-base-content">
              Upload Verification Evidence
            </h3>
          </div>
          <p className="text-xs text-base-content/60">
            Field agents and broadcast liaisons attach execution proof to active client flights.
          </p>

          <form onSubmit={handleSimulateUpload} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content">
                Select Active Flight
              </label>
              <select className="select select-bordered select-sm w-full rounded-xl text-xs">
                <option>CAMP-8841 · Lekki Toll Phase 1 Mega Display</option>
                <option>CAMP-8840 · Cool FM & Nigeria Info Drive Time</option>
                <option>CAMP-8839 · Channels TV Prime Evening News</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content">
                Proof Type
              </label>
              <select className="select select-bordered select-sm w-full rounded-xl text-xs">
                <option>Billboard Day-time Loop Photo</option>
                <option>Billboard Night-time Illuminated Photo</option>
                <option>Radio Signed Broadcast Affidavit (PDF)</option>
                <option>Television Broadcast Transmission Log</option>
                <option>Newspaper Scanned Tearsheet</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content">
                Broadcast Timestamp
              </label>
              <input
                type="datetime-local"
                className="input input-bordered input-sm w-full rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content">
                Attach File (Photo / PDF / Video)
              </label>
              <input
                type="file"
                className="file-input file-input-bordered file-input-sm w-full rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="btn btn-sm btn-primary w-full rounded-xl text-xs font-bold mt-2 flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Verify & Publish to Client</span>
            </button>
          </form>
        </div>

        {/* Verified Records Table (2 cols) */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-200">
            <div>
              <h3 className="text-base font-bold text-base-content">
                Recent Verification Deliveries
              </h3>
              <p className="text-xs text-base-content/60">
                Audited proof records currently visible on advertiser dashboards.
              </p>
            </div>
            <span className="badge badge-success badge-sm font-bold">
              98.4% Compliance Rate
            </span>
          </div>

          <div className="divide-y divide-base-200">
            {popRecords.map((pop) => (
              <div
                key={pop.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-base-200/50 px-2 rounded-2xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {pop.id}
                    </span>
                    <span className="badge badge-xs badge-success font-bold text-[10px]">
                      {pop.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-base-content mt-1">
                    {pop.campaign}
                  </h4>
                  <div className="text-xs text-base-content/70">
                    {pop.channel} · {pop.type}
                  </div>
                  <div className="text-[10px] text-base-content/50 font-mono mt-0.5">
                    Logged: {pop.dateRecorded} by {pop.verifiedBy}
                  </div>
                </div>

                <button className="btn btn-xs btn-ghost border border-base-300 rounded-lg text-xs font-bold self-start sm:self-auto flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Asset</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

