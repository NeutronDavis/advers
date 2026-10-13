"use client";

import React from "react";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section id="cta" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24 perspective-2000">
      <div className="bg-primary rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-16 lg:p-24 text-center text-primary-content relative overflow-hidden shadow-3d group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary opacity-90 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>Ready for Real Commercial Growth?</span>
          </div>

          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Your competitors aren&apos;t better than you. <br className="hidden sm:block" />
            <span className="text-accent underline decoration-accent/40 decoration-wavy">They&apos;re just more visible.</span>
          </h2>

          <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop losing qualified clients to noisy competitors. Partner with Advers to establish your brand identity, launch an authoritative web engine, and amplify your message across high-traffic billboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/visibility-journey"
              className="btn btn-neutral bg-base-100 text-primary hover:bg-base-200 border-none px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all active:scale-95 text-center"
            >
              Claim Your Visibility Package
            </Link>

            <Link
              href="/contact"
              className="btn btn-outline border-white/30 backdrop-blur-md text-white hover:bg-white/15 hover:border-white px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg transition-all text-center"
            >
              Talk to Growth Strategists
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-white/75 font-medium">
            <span className="flex items-center gap-1.5">✓ Complete Brand-to-Billboard Delivery</span>
            <span className="flex items-center gap-1.5">✓ Zero Tech Headaches</span>
            <span className="flex items-center gap-1.5">✓ 100% Guaranteed Market Presence</span>
          </div>
        </div>
      </div>
    </section>
  );
}
