"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle2, Sparkles, Globe, MapPin, Eye, Layers } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden py-12 sm:py-20 lg:py-28 min-h-[600px] flex items-center"
    >
      {/* Background glow & subtle pattern */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-primary/5 via-base-100 to-base-100 pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Core Positioning & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-primary/20 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Full-Service Brand Visibility &amp; Growth</span>
            </div>

            <h1 className="hero-animate-title text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-base-content leading-[1.1] tracking-tight">
              Stop Being Invisible. <br className="hidden sm:block" />
              We Build Your Brand, Launch Your Web Presence, and <span className="text-primary">Put You on Every Screen.</span>
            </h1>

            <p className="hero-animate-sub text-base sm:text-lg lg:text-xl text-base-content/80 max-w-2xl leading-relaxed font-normal">
              No more juggling 5 disconnected freelancers, web designers, and media reps.{" "}
              <strong className="text-base-content font-semibold">Advers</strong> gives growing businesses and SMEs the complete package: corporate brand identity, high-speed custom websites, local Google search dominance, and high-impact digital billboard advertising across Nigeria.
            </p>

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
                className="btn btn-outline border-base-300 hover:bg-base-200 text-base-content text-base sm:text-lg rounded-xl font-bold flex items-center justify-center gap-1.5 px-6 py-3.5 h-auto transition-all"
              >
                Explore Packages
                <ChevronRight className="w-5 h-5 opacity-60" />
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-base-content/75 font-semibold">
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

          {/* Right Column: Interactive daisyUI Omnichannel Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* daisyUI Browser Mockup (Web Engine) */}
              <div className="mockup-browser border border-base-300 bg-base-100 shadow-3d rounded-3xl overflow-hidden">
                <div className="mockup-browser-toolbar bg-base-200/80">
                  <div className="input input-xs bg-base-100 text-base-content/70 font-mono text-[11px] flex items-center gap-2">
                    <Globe className="w-3 h-3 text-primary" />
                    https://yourbusiness.ng
                  </div>
                </div>

                <div className="bg-base-100 p-5 space-y-4">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-base-200 pb-3">
                    <div className="flex items-center gap-2">
                      <img src="/logo.png" alt="Advers" className="h-6 w-auto object-contain" />
                      <span className="font-extrabold text-xs tracking-tight text-base-content">Advers Verified</span>
                    </div>
                    <span className="badge badge-success badge-sm font-bold text-[10px]">● Live &amp; Indexed</span>
                  </div>

                  {/* Mockup Hero Card inside browser */}
                  <div className="rounded-xl bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-md space-y-2">
                    <span className="badge badge-outline text-white text-[10px] font-bold">Omnichannel Engine</span>
                    <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                      Total Market Dominance for Growing Brands
                    </h4>
                    <p className="text-[11px] text-white/80 leading-relaxed">
                      Custom 3-5 page web engine with real-time lead forms and automated WhatsApp booking.
                    </p>
                  </div>

                  {/* 3 mini stats inside mockup */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-base-200 p-2 rounded-lg">
                      <div className="text-primary font-black text-xs">100%</div>
                      <div className="text-[10px] text-base-content/60 font-medium">On-Page SEO</div>
                    </div>
                    <div className="bg-base-200 p-2 rounded-lg">
                      <div className="text-primary font-black text-xs">5.0 ★</div>
                      <div className="text-[10px] text-base-content/60 font-medium">Google Maps</div>
                    </div>
                    <div className="bg-base-200 p-2 rounded-lg">
                      <div className="text-primary font-black text-xs">LED Ready</div>
                      <div className="text-[10px] text-base-content/60 font-medium">Billboard Sync</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: Brand Foundation Pill */}
              <div className="absolute -top-4 -left-4 sm:-left-6 glass-card p-3 rounded-2xl shadow-xl border border-base-200 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-base-content">Brand Foundation</div>
                  <div className="text-[10px] text-base-content/70 font-medium">Logo Suite &amp; Guidelines</div>
                </div>
              </div>

              {/* Floating Badge 2: Outdoor Billboard Amplifier */}
              <div className="absolute -bottom-5 -right-3 sm:-right-5 glass-card p-3.5 rounded-2xl shadow-2xl border border-base-200 flex items-center gap-3 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center font-bold shadow-md">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-base-content">Outdoor Amplification</div>
                  <div className="text-[10px] text-base-content/70 font-medium">Overpass &amp; Mall LED Screens</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
