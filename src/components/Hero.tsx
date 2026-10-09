"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden py-14 sm:py-20 lg:py-32 min-h-[500px] sm:min-h-[620px] flex items-center"
    >
      {/* Full Screen Edge-to-Edge Background Picture with Hero Entrance Scale Animation */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat hero-animate-bg"
        style={{ backgroundImage: `url("/hero.jfif")` }}
      />

      {/* High-contrast adaptive gradient overlay (Light / Dark) */}
      <div className="absolute inset-0 w-full h-full hero-overlay-gradient" />

      {/* Inner Content Container with Staggered Entrance Animations */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl space-y-6 sm:space-y-8">
          <h1 className="hero-animate-title text-3xl sm:text-5xl lg:text-[4.25rem] font-extrabold text-base-content leading-[1.1] tracking-tight">
            Put Your Brand on <br className="hidden sm:block" />
            <span className="text-primary">Every Screen</span>
          </h1>

          <p className="hero-animate-sub text-base sm:text-lg lg:text-xl text-base-content/80 max-w-xl leading-relaxed font-medium">
            Connect with premium billboard owners across Nigeria. Create,
            manage, and track your outdoor advertising campaigns – all from one
            powerful dashboard.
          </p>

          <div className="hero-animate-btns flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
            <a
              href="#placements"
              className="bg-primary hover:bg-primary/90 text-primary-content px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-3d hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Start Your Campaign
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#placements"
              className="bg-base-100/80 hover:bg-base-100 text-base-content font-bold text-base sm:text-lg flex items-center justify-center gap-1 hover:gap-2 transition-all group px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-base-300 shadow-sm backdrop-blur-md"
            >
              Explore Inventory
              <ChevronRight className="w-5 h-5 text-base-content/50 group-hover:text-primary transition-all" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
