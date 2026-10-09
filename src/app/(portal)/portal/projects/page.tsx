"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, CheckCircle2, Clock, MapPin, Sparkles } from "lucide-react";

export default function ClientProjectsPage() {
  const projects = [
    {
      id: "PRJ-2026-01",
      name: "3-5 Page Custom Website & Brand Identity",
      package: "Look Professional Tier",
      status: "In Production",
      progress: 75,
      deliveryDate: "Oct 15, 2026",
    },
  ];

  const billboardBookings = [
    {
      id: "BK-LAG-08",
      location: "Victoria Island Highway LED",
      city: "Lagos",
      status: "Active Slot Reserved",
      impressions: "400k+ Weekly",
    },
  ];

  return (
    <div className="space-y-6 animate-entrance">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Projects &amp; Bookings
          </h1>
          <p className="text-xs text-base-content/70">
            Track active digital package production &amp; billboard ad slots
          </p>
        </div>

        <Link
          href="/visibility-journey"
          className="btn bg-[#4f46e5] text-white text-xs font-bold rounded-xl border-none shadow-md hidden sm:inline-flex"
        >
          Add New Package
        </Link>
      </div>

      {/* Digital Package Projects */}
      <div className="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-3d space-y-4">
        <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-primary" />
          <span>Active Digital Projects</span>
        </h2>

        {projects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-base-200/50 border border-base-200 space-y-3"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {p.id} • {p.package}
                </span>
                <h3 className="text-base font-extrabold text-base-content">{p.name}</h3>
              </div>
              <span className="badge badge-warning text-xs font-bold">{p.status}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-base-content/70">
                <span>Production Progress</span>
                <span>{p.progress}%</span>
              </div>
              <progress
                className="progress progress-primary w-full h-2.5 rounded-full"
                value={p.progress}
                max="100"
              />
            </div>

            <div className="text-xs text-base-content/60 font-medium">
              Target Delivery: <span className="font-bold text-base-content">{p.deliveryDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Billboard Bookings */}
      <div className="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-3d space-y-4">
        <h2 className="text-lg font-extrabold text-base-content flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span>Outdoor Billboard Placements</span>
        </h2>

        {billboardBookings.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-base-200/50 border border-base-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          >
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {b.id} • {b.city}
              </span>
              <h3 className="text-base font-extrabold text-base-content">{b.location}</h3>
              <p className="text-xs text-base-content/60">{b.impressions}</p>
            </div>
            <span className="badge badge-success text-xs font-bold text-white">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
