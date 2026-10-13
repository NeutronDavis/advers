"use client";

import React from "react";
import { XCircle, CheckCircle2, Layers, Globe, Eye, Sparkles } from "lucide-react";

export default function ModernStandardSection() {
  return (
    <section id="why-advers" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24 perspective-2000">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Column: Problem & Solution Copy */}
        <div className="w-full lg:w-1/2 space-y-6">
  

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content leading-tight tracking-tight">
            Why Most Growing Businesses Stay Invisible{" "}
            <span className="text-primary">(And How Advers Fixes It)</span>
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-base-content/80 leading-relaxed font-normal">
            <p>
              Most businesses in Nigeria don’t have an aligned marketing strategy—they have a chaotic puzzle. You hire one freelancer for a logo, pay another for a slow website, struggle to verify your Google Maps profile, and wonder why customers aren&apos;t calling.
            </p>
            <p>
              Scattering your capital across uncoordinated vendors creates weak messaging. A billboard without a credible website loses leads. A website without local SEO gets zero visitors. A business without commanding brand identity gets negotiated down on price.
            </p>
            <p className="font-semibold text-base-content">
              <strong className="text-primary font-bold">Advers</strong> solves this completely: we unite corporate brand design, high-speed web engineering, and high-impact digital billboard advertising under one roof.
            </p>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-card p-3.5 rounded-2xl border border-base-200">
              <Layers className="w-5 h-5 text-primary mb-1.5" />
              <div className="text-xs font-bold text-base-content">Brand Identity</div>
              <div className="text-[11px] text-base-content/65">Command respect</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-base-200">
              <Globe className="w-5 h-5 text-primary mb-1.5" />
              <div className="text-xs font-bold text-base-content">Web &amp; Local SEO</div>
              <div className="text-[11px] text-base-content/65">24/7 lead engine</div>
            </div>
            <div className="glass-card p-3.5 rounded-2xl border border-base-200">
              <Eye className="w-5 h-5 text-primary mb-1.5" />
              <div className="text-xs font-bold text-base-content">Digital Billboards</div>
              <div className="text-[11px] text-base-content/65">Highway authority</div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Card (Fragmented vs Advers) */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* The Fragmented Way Card */}
            <div className="rounded-3xl p-6 bg-base-200/60 border border-base-300 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-error font-bold text-sm">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>The Fragmented Trap</span>
              </div>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Juggling 5 different contractors with no accountability:
              </p>
              <ul className="space-y-2.5 text-xs text-base-content/75">
                <li className="flex items-start gap-2">
                  <span className="text-error font-bold">✕</span>
                  <span>Logo designer ignores your website strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error font-bold">✕</span>
                  <span>Slow website with zero Google search optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error font-bold">✕</span>
                  <span>Weeks of delays and finger-pointing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-error font-bold">✕</span>
                  <span>Billboards locked behind bloated agency retainers</span>
                </li>
              </ul>
            </div>

            {/* The Advers Way Card */}
            <div className="rounded-3xl p-6 bg-base-100 border-2 border-primary shadow-3d space-y-4 relative overflow-hidden ring-4 ring-primary/10">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>The Advers Standard</span>
              </div>
              <p className="text-xs text-base-content/80 leading-relaxed">
                One turnkey partner for complete physical &amp; digital reach:
              </p>
              <ul className="space-y-2.5 text-xs text-base-content">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Unified brand identity</strong> across all touchpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>High-converting custom website</strong> with local SEO</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Fast turnarounds:</strong> launched in days, not months</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Direct LED billboard campaigns</strong> without brokers</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
