"use client";

import React, { useState } from "react";
import { useCampaign } from "@/context/CampaignContext";
import {
  Headphones,
  MessageSquare,
  HelpCircle,
  Phone,
  Mail,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function HelpAndSupportPage() {
  const { showToast } = useCampaign();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setTicketSubject("");
    setTicketMessage("");
    showToast("Support ticket submitted! Our media desk will reply within 30 minutes.");
  };

  const faqs = [
    {
      q: "How does Advers verify that my billboard or radio ad actually played?",
      a: "For billboards, our field ops team captures timestamped, geotagged photos and high-resolution loop video during day and night. For radio and TV, our partner stations issue certified transmission affidavits and station broadcast logs signed by station management.",
    },
    {
      q: "What creative formats are accepted for digital billboard screens?",
      a: "Most digital billboard screens run 15-second or 30-second spots in MP4 or MOV format (1920x1080 horizontal or 1080x1920 portrait) at 30/60 fps with no sound. High-res static images in JPEG or TIFF at 300 DPI are also accepted.",
    },
    {
      q: "How do AdBooster commissions work?",
      a: "When you launch an AdBooster campaign, you allocate a commission pool. Verified community promoters share your flyers and unique tracking links. Promoters only earn when valid impressions or conversions are logged and anti-fraud checks clear.",
    },
    {
      q: "Can I cancel a scheduled campaign before it goes live?",
      a: "Yes. Campaigns in 'Draft' or 'Pending Review' can be cancelled immediately with 100% wallet refund. Once a campaign has been locked with a broadcast station or printer, cancellation is subject to the media partner's lead-time policy.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e8e9ed]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#9a752b]">
            Direct Media Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15171b] tracking-tight">
            Help & Media Support
          </h1>
          <p className="text-xs sm:text-sm text-[#7c818b] mt-0.5">
            Connect with our media planning specialists for slot clearances, rate quotes, and technical specs.
          </p>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WhatsApp Direct */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#e4f6ec] text-[#19764b] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#15171b]">
              WhatsApp Media Desk
            </h3>
            <p className="text-[11px] text-[#7c818b] mt-0.5">
              Direct chat with our operations lead for quick slot confirmations.
            </p>
          </div>
          <a
            href="https://wa.me/2348000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm bg-[#16845b] hover:bg-[#126b4a] text-white border-none rounded-xl text-xs font-bold w-full"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Priority Phone */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#fff4d9] text-[#986d16] flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#15171b]">
              Direct Phone Line
            </h3>
            <p className="text-[11px] text-[#7c818b] mt-0.5">
              Monday to Saturday, 8:00 AM – 7:00 PM WAT.
            </p>
          </div>
          <a
            href="tel:+2348000000000"
            className="btn btn-sm bg-[#101113] hover:bg-black text-white border-none rounded-xl text-xs font-bold w-full"
          >
            Call Support Desk
          </a>
        </div>

        {/* Email Enquiries */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0f0f2] text-[#666c77] flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#15171b]">
              Media Email Desk
            </h3>
            <p className="text-[11px] text-[#7c818b] mt-0.5">
              Send heavy media files or RFPs to media@advers.ng.
            </p>
          </div>
          <a
            href="mailto:media@advers.ng"
            className="btn btn-sm btn-ghost border-[#e8e9ed] rounded-xl text-xs font-bold w-full"
          >
            media@advers.ng
          </a>
        </div>
      </div>

      {/* Ticket & FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Ticket */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-[#80601f]" />
            <h3 className="text-base font-bold text-[#15171b]">
              Submit a Media Request
            </h3>
          </div>
          <p className="text-xs text-[#7c818b]">
            Have a question about an active campaign flight, billing, or custom media packages?
          </p>

          <form onSubmit={handleTicketSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#15171b]">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule adjustment for Lekki billboard"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="input input-bordered w-full text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#15171b]">
                Message Details
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide campaign name or requirements..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                className="textarea textarea-bordered w-full text-xs rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="btn btn-sm bg-[#101113] hover:bg-black text-white border-none rounded-xl text-xs font-bold w-full flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Request to Media Desk</span>
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="card bg-white border border-[#e8e9ed] rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-[#f0f0f2]">
            <HelpCircle className="w-5 h-5 text-[#80601f]" />
            <h3 className="text-base font-bold text-[#15171b]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 bg-[#f8f9fa] rounded-2xl space-y-1">
                <div className="text-xs font-bold text-[#15171b]">
                  {faq.q}
                </div>
                <p className="text-[11px] text-[#7c818b] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

