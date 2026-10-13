"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden -mt-16 sm:-mt-20 pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28 lg:pb-36 min-h-[600px] sm:min-h-[700px] flex items-center"
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
          
          {/* Punchy, Streamlined Headline */}
          <h1 className="hero-animate-title text-3xl sm:text-5xl lg:text-[4rem] font-black text-base-content leading-[1.12] tracking-tight">
            Stop Being Invisible. <br className="hidden sm:block" />
            <span className="text-primary">Put Your Brand on Every Screen.</span>
          </h1>

          {/* Crisp, Direct Subtext */}
          <p className="hero-animate-sub text-base sm:text-lg lg:text-xl text-base-content/80 max-w-xl leading-relaxed font-normal">
            Advers builds your brand identity, launches your high-speed web presence, and puts your business on prime digital billboards across Nigeria.
          </p>

          {/* Clean Action CTAs */}
          <div className="hero-animate-btns flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-1">
            <Link
              href="/visibility-journey"
              className="btn btn-primary text-primary-content text-base sm:text-lg rounded-xl font-bold shadow-3d hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 px-7 py-3.5 h-auto border-none"
            >
              Claim Visibility Package
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

        </div>
      </div>
    </section>
  );
}
