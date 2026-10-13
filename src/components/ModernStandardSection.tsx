"use client";

import React from "react";
import { XCircle, CheckCircle2, Layers, Globe, Eye } from "lucide-react";

export default function ModernStandardSection() {
  return (
    <section id="why-advers" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24">
      {/* Top Row: Context & Problem Copy (Left) + 3 Core Capability Cards (Right) */}
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        
        {/* Left Column: Problem & Solution Copy */}
        <div className="w-full lg:w-1/2 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content leading-tight tracking-tight">
            Why Most Growing Businesses Stay Invisible{" "}
            <span className="text-primary">(And How Advers Fixes It)</span>
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-base-content/80 leading-relaxed font-normal">
            <p>
              Most businesses in Nigeria don’t have an aligned marketing strategy, they have a chaotic puzzle. You hire one freelancer for a logo, pay another for a slow website, struggle to verify your Google Maps profile, and wonder why customers aren&apos;t calling.
            </p>
            <p>
              Scattering your capital across uncoordinated vendors creates weak messaging. A billboard without a credible website loses leads. A website without local SEO gets zero visitors. A business without commanding brand identity gets negotiated down on price.
            </p>
            <p className="font-semibold text-base-content">
              <strong className="text-primary font-bold">Advers</strong> solves this completely: we unite corporate brand design, high-speed web engineering, and high-impact digital billboard advertising under one roof.
            </p>
          </div>
        </div>

        {/* Right Column: 3 Pillar Capability Cards */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-base-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-base-content">Brand Identity</h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1 leading-relaxed">
                Command corporate respect with custom vector logos, brand guidelines, and executive profiles.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-base-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-base-content">Web &amp; Local SEO</h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1 leading-relaxed">
                A 24/7 lead capture engine with high-speed custom pages, Google Maps setup, and instant WhatsApp booking.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-3xl border border-base-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-base-content">Digital Billboards</h3>
              <p className="text-xs sm:text-sm text-base-content/70 mt-1 leading-relaxed">
                Highway &amp; landmark LED screens across Lagos, Abuja, and Port Harcourt for unmistakable presence.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Second Row: Comparison Cards (The Fragmented Trap vs The Advers Standard) */}
      <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* The Fragmented Way Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-base-200/60 border border-base-300 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-error font-extrabold text-base">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>The Fragmented Trap</span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-medium">
            Juggling 5 different uncoordinated contractors with zero accountability:
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-base-content/80">
            <li className="flex items-start gap-2.5">
              <span className="text-error font-bold text-base leading-none">✕</span>
              <span>Logo designer works in isolation and ignores your commercial website goals</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-error font-bold text-base leading-none">✕</span>
              <span>Slow, generic website with broken contact forms and zero Google search ranking</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-error font-bold text-base leading-none">✕</span>
              <span>Weeks of missed deadlines, finger-pointing, and surprise extra charges</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-error font-bold text-base leading-none">✕</span>
              <span>Billboards locked behind gatekeepers and expensive long-term retainers</span>
            </li>
          </ul>
        </div>

        {/* The Advers Way Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-base-100 border-2 border-primary shadow-3d space-y-5 relative overflow-hidden ring-4 ring-primary/10">
          <div className="flex items-center gap-2.5 text-primary font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>The Advers Standard</span>
          </div>
          <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-medium">
            One turnkey growth partner for complete physical &amp; digital market authority:
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-base-content">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Unified brand identity:</strong> Consistent visuals across decks, web, and outdoor</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong>High-converting custom website:</strong> Mobile-first, fast-loading with local SEO</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Predictable delivery:</strong> Launched end-to-end in 10 to 14 days, not months</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span><strong>Direct LED billboard reach:</strong> Prime Nigerian cities with verified broadcast proof</span>
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}
