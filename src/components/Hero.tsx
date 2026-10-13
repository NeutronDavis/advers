"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden -mt-16 sm:-mt-20 pt-28 sm:pt-36 lg:pt-44 pb-16 sm:pb-24 lg:pb-32 min-h-[620px] sm:min-h-[720px] flex items-center"
    >
      {/* Full Screen Edge-to-Edge Background Image with Entrance Scale Animation */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat hero-animate-bg"
        style={{ backgroundImage: `url("/hero.jfif")` }}
      />

      {/* Theme-Adaptive High-Contrast Gradient Overlay (Light / Dark) */}
      <div className="absolute inset-0 w-full h-full hero-overlay-gradient pointer-events-none" />

      {/* Subtle bottom fade into the base background */}
      <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-base-100 via-base-100/60 to-transparent pointer-events-none" />

      {/* Inner Content Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-8">
          
          {/* Service Pillar Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-primary/20 shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Full-Service Brand Visibility &amp; Growth</span>
          </div>

          {/* High-Converting Main Headline */}
          <h1 className="hero-animate-title text-3xl sm:text-5xl lg:text-[4rem] font-extrabold text-base-content leading-[1.1] tracking-tight">
            Stop Being Invisible. <br className="hidden sm:block" />
            We Build Your Brand, Launch Your Web Presence, and{" "}
            <span className="text-primary">Put You on Every Screen.</span>
          </h1>

          {/* Subtext Highlighting The Unified Agency Standard */}
          <p className="hero-animate-sub text-base sm:text-lg lg:text-xl text-base-content/85 max-w-2xl leading-relaxed font-normal">
            No more juggling 5 disconnected freelancers, web designers, and media reps.{" "}
            <strong className="text-base-content font-bold">Advers</strong> gives growing businesses and SMEs the complete package: corporate brand identity, high-speed custom websites, local Google search dominance, and high-impact digital billboard advertising across Nigeria.
          </p>

          {/* Action CTAs */}
          <div className="hero-animate-btns flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
            <Link
              href="/visibility-journey"
              className="btn btn-primary text-primary-content text-base sm:text-lg rounded-xl font-bold shadow-3d hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 px-7 py-3.5 h-auto border-none"
            >
              Claim Your Visibility Package
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#packages"
              className="btn btn-outline border-base-content/25 hover:bg-base-content/10 text-base-content text-base sm:text-lg rounded-xl font-bold flex items-center justify-center gap-1.5 px-6 py-3.5 h-auto transition-all backdrop-blur-md"
            >
              Explore Packages
              <ChevronRight className="w-5 h-5 opacity-60" />
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-base-content/85 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Brand, Web &amp; Outdoor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Days, Not Months</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Across Lagos, Abuja &amp; PH</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
