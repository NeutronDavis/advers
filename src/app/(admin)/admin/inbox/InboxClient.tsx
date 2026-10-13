"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Search,
  Mail,
  UserCheck,
  ArrowLeft,
  Sparkles,
  Phone,
  Building,
  Archive,
  ChevronRight,
} from "lucide-react";

export interface DatabaseFeedbackDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  type: string;
  status: string;
  message: string;
  packageInterest?: string | null;
  source?: string | null;
  internalNote?: string | null;
  createdAt: string;
}

export default function InboxClient({
  initialInquiries,
}: {
  initialInquiries: DatabaseFeedbackDTO[];
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(
    initialInquiries[0]?.id || ""
  );
  const [staffNote, setStaffNote] = useState<string>("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState<boolean>(false);

  // Filtering
  const filteredInquiries = initialInquiries.filter((item) => {
    const matchesFilter = filter === "ALL" || item.status === filter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedInquiry =
    initialInquiries.find((item) => item.id === selectedId) ||
    filteredInquiries[0] ||
    initialInquiries[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Main Inbox Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-2">
            <Inbox className="w-7 h-7 text-primary" />
            <span>Lead &amp; Enquiry Inbox</span>
            <span className="badge badge-primary text-xs font-bold">
              {initialInquiries.filter((i) => i.status === "NEW").length} New
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 font-medium mt-1">
            Split-view message center for qualifying incoming client enquiries and sending account invitations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar">
          {["ALL", "NEW", "IN_REVIEW", "QUALIFIED", "RESOLVED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200/80 text-base-content/70 hover:bg-base-300"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Single Panel Split-Screen View (Left List + Vertical Divider + Right Body) */}
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-3d overflow-hidden flex flex-col lg:flex-row min-h-[650px]">
        {/* Left Column: Messages List Container */}
        <div
          className={`w-full lg:w-5/12 xl:w-4/12 border-b lg:border-b-0 lg:border-r border-base-200 p-4 flex flex-col space-y-4 shrink-0 ${
            mobileDetailOpen ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, names, or messages..."
              className="input input-bordered w-full pl-10 bg-base-200/50 text-xs h-10 rounded-xl focus:border-primary"
            />
            <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3" />
          </div>

          {/* List of Messages */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[580px]">
            {filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-base-content/60">
                No enquiries matching specified filters.
              </div>
            ) : (
              filteredInquiries.map((item) => {
                const isSelected = selectedInquiry && item.id === selectedInquiry.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col space-y-2 ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-base-100 border-base-200 hover:border-primary/40 hover:bg-base-200/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary text-[10px] font-bold">
                          {item.id}
                        </span>
                        <h4 className="text-xs font-extrabold text-base-content truncate max-w-[140px]">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-base-content/50">
                        {new Date(item.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-primary truncate">
                      {item.company || "Independent"} • {item.packageInterest || "General Inquiry"}
                    </div>

                    <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed font-normal">
                      &ldquo;{item.message}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`badge text-[9px] font-extrabold ${
                          item.status === "NEW"
                            ? "badge-warning"
                            : item.status === "IN_REVIEW"
                            ? "badge-info text-white"
                            : item.status === "QUALIFIED"
                            ? "badge-success text-white"
                            : "badge-ghost"
                        }`}
                      >
                        {item.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-base-content/40" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Content & Action Panel */}
        <div
          className={`flex-1 p-6 flex flex-col justify-between space-y-6 ${
            mobileDetailOpen ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedInquiry ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileDetailOpen(false)}
                  className="lg:hidden btn btn-xs btn-outline border-base-300 mb-4 gap-1 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Message List</span>
                </button>

                {/* Top Header Card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-base-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base shrink-0">
                      {selectedInquiry.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-base-content">
                          {selectedInquiry.name}
                        </h2>
                        {selectedInquiry.company && (
                          <span className="text-xs text-base-content/60 font-semibold">
                            ({selectedInquiry.company})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-base-content/60">
                        Received: {new Date(selectedInquiry.createdAt).toLocaleString("en-NG")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`badge text-xs font-bold py-2 ${
                        selectedInquiry.status === "NEW"
                          ? "badge-warning"
                          : selectedInquiry.status === "IN_REVIEW"
                          ? "badge-info text-white"
                          : selectedInquiry.status === "QUALIFIED"
                          ? "badge-success text-white"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>

                {/* Contact Quick Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                  <div className="p-3.5 bg-base-200/40 rounded-2xl border border-base-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-bold text-base-content hover:text-primary transition-colors block truncate"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>

                  <div className="p-3.5 bg-base-200/40 rounded-2xl border border-base-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedInquiry.phone || ""}`}
                      className="font-bold text-base-content hover:text-primary transition-colors block"
                    >
                      {selectedInquiry.phone || "Not provided"}
                    </a>
                  </div>
                </div>

                {/* Package Interest Tag */}
                {selectedInquiry.packageInterest && (
                  <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between text-xs font-bold text-primary mb-4">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Package Interest: {selectedInquiry.packageInterest}</span>
                    </span>
                  </div>
                )}

                {/* Enquiry Message Body */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/70 block">
                    Message Body
                  </span>
                  <div className="p-5 rounded-2xl bg-base-200/50 border border-base-200 text-xs leading-relaxed text-base-content/90 font-medium">
                    &ldquo;{selectedInquiry.message}&rdquo;
                  </div>
                </div>

                {/* Staff Internal Note Section */}
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/70 block">
                    Staff Internal Note / Action Log
                  </span>
                  <textarea
                    value={staffNote || selectedInquiry.internalNote || ""}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Add internal notes for staff backoffice team..."
                    className="textarea textarea-bordered w-full text-xs bg-base-200/40 rounded-xl h-20"
                  />
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-4 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button className="btn btn-outline border-base-300 text-xs font-bold rounded-xl h-10 px-3.5 gap-1.5 flex-1 sm:flex-none">
                    <Archive className="w-4 h-4 text-base-content/60" />
                    <span>Archive</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/accept-invite?token=${selectedInquiry.id}`}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-10 px-4 border-none shadow-md gap-2 w-full sm:w-auto flex items-center justify-center"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Send Account Invite</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-base-content/50">
              <Mail className="w-12 h-12 mb-3 text-base-content/30" />
              <p className="text-xs font-bold">Select a message from the left list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
