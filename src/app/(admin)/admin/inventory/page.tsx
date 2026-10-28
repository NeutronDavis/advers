"use client";

import React, { useState } from "react";
import {
  Tv,
  Radio,
  Newspaper,
  Mic,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function MediaInventoryPage() {
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [search, setSearch] = useState("");

  const inventoryItems = [
    {
      id: "INV-DOOH-01",
      name: "Lekki Toll Gate Phase 1 Mega Screen",
      channel: "DOOH",
      type: "Commercial LED Billboard",
      city: "Lagos",
      size: "18m x 6m (1080x1920 portrait)",
      loopCapacity: "12 slots (15s spot)",
      availableSlots: 4,
      dailyRate: "₦25,000 / day",
      owner: "Elevate Media Network",
      status: "OPERATIONAL",
    },
    {
      id: "INV-DOOH-02",
      name: "Peter Odili Road Trans-Amadi Hub",
      channel: "DOOH",
      type: "Gantry LED Screen",
      city: "Port Harcourt",
      size: "12m x 4m (1920x1080 landscape)",
      loopCapacity: "10 slots (15s spot)",
      availableSlots: 2,
      dailyRate: "₦18,000 / day",
      owner: "Rivers Outdoor Ltd",
      status: "OPERATIONAL",
    },
    {
      id: "INV-RAD-01",
      name: "Cool FM 96.9 & Nigeria Info 99.3",
      channel: "RADIO",
      type: "Commercial FM Broadcast",
      city: "Lagos / Port Harcourt / Abuja",
      size: "Drive Time Belts (6am–10am, 4pm–8pm)",
      loopCapacity: "30 spots daily",
      availableSlots: 8,
      dailyRate: "₦15,000 / 30s spot",
      owner: "AIM Group Broadcasters",
      status: "OPERATIONAL",
    },
    {
      id: "INV-TV-01",
      name: "Channels Television Prime Belt",
      channel: "TV",
      type: "Terrestrial & DStv News",
      city: "Nationwide",
      size: "Evening News Hour (7pm–10pm)",
      loopCapacity: "12 commercial breaks",
      availableSlots: 3,
      dailyRate: "₦95,000 / 30s spot",
      owner: "Channels Media Group",
      status: "OPERATIONAL",
    },
    {
      id: "INV-PRINT-01",
      name: "The Punch Daily National Newspaper",
      channel: "PRINT",
      type: "Print Display Advertising",
      city: "Nationwide Circulation",
      size: "Full Page / Half Page / Front Strip",
      loopCapacity: "Daily Edition",
      availableSlots: 5,
      dailyRate: "₦320,000 / full page",
      owner: "Punch Nigeria Limited",
      status: "OPERATIONAL",
    },
  ];

  const filtered = inventoryItems.filter((item) => {
    const matchesChannel =
      selectedChannel === "ALL" || item.channel === selectedChannel;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase()) ||
      item.owner.toLowerCase().includes(search.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Asset Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Media Inventory Directory
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Manage physical LED screens, radio/TV station rate cards, and slot availability calendars.
          </p>
        </div>

        <button
          onClick={() => alert("Add Screen / Media Partner Modal")}
          className="btn btn-sm btn-primary rounded-xl text-xs font-bold px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Inventory Asset</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Assets" },
            { id: "DOOH", label: "Digital Billboards" },
            { id: "RADIO", label: "Radio Stations" },
            { id: "TV", label: "Television" },
            { id: "PRINT", label: "Press" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id)}
              className={`btn btn-xs sm:btn-sm rounded-xl text-xs font-bold transition-all ${
                selectedChannel === tab.id
                  ? "btn-primary shadow-xs"
                  : "btn-ghost border border-base-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-base-content/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm w-full bg-base-100 border-base-300 rounded-xl pl-8 text-xs"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card bg-base-100 border border-base-200 rounded-3xl p-5 sm:p-6 shadow-xs overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-[10px] font-bold uppercase text-base-content/60 border-b border-base-200">
              <th>Asset & Specs</th>
              <th>Channel & City</th>
              <th>Media Partner / Owner</th>
              <th>Rate Card</th>
              <th>Slot Availability</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-base-200/50 transition-colors">
                <td>
                  <div className="font-black text-base-content">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-base-content/50 font-mono">
                    {item.id} · {item.size}
                  </div>
                </td>
                <td>
                  <div className="font-bold text-base-content">
                    {item.channel}
                  </div>
                  <div className="text-[10px] text-base-content/60">
                    {item.city}
                  </div>
                </td>
                <td className="text-base-content/80 font-medium">
                  {item.owner}
                </td>
                <td className="font-mono font-bold text-base-content">
                  {item.dailyRate}
                </td>
                <td>
                  <span className="badge badge-sm badge-success badge-soft font-bold text-[10px]">
                    {item.availableSlots} slots open
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-success">
                    <span className="w-2 h-2 rounded-full bg-success inline-block" />
                    <span>Active</span>
                  </span>
                </td>
                <td className="text-right">
                  <button className="btn btn-xs btn-ghost border border-base-300 rounded-lg text-xs font-bold">
                    Edit Rates
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

