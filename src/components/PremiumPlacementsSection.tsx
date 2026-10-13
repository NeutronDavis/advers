"use client";

import React from "react";
import { Eye, Sparkles, CheckCircle2 } from "lucide-react";

export default function PremiumPlacementsSection() {
  const placements = [
    {
      title: "Lagos Island Digital",
      impressions: "400k+ Weekly Impressions • Victoria Island",
      img: "/lagos-billboard.png",
    },
    {
      title: "Abuja Expressway",
      impressions: "Central Business District • High Impact Overpass",
      img: "/abuja-expressway.png",
    },
    {
      title: "Port Harcourt Mall",
      impressions: "Premium Retail Crowd • Luxury Commercial Hub",
      img: "/portharcourt-mall.png",
    },
  ];

  return (
    <section id="billboard-pillar" className="py-14 sm:py-24 bg-base-200/40 backdrop-blur-sm border-y border-base-200 perspective-2000">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 preserve-3d">
        
        <div className="mb-10 sm:mb-14 space-y-3 sm:space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>The Outdoor Visibility Pillar</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight">
            From the Screen in Their Hands to the Screen on the Highway
          </h2>
          
          <p className="text-base sm:text-lg text-base-content/80 leading-relaxed font-normal">
            Digital marketing earns you clicks; real-world outdoor media builds untouchable authority. As part of our omnichannel visibility ecosystem, <strong className="text-base-content font-semibold">Advers</strong> gives your business direct access to Nigeria’s premier network of digital LED billboards.
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-sm text-xs sm:text-sm font-semibold text-base-content">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Zero Broker Red Tape</span>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-sm text-xs sm:text-sm font-semibold text-base-content">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Synchronized Web + LED Campaigns</span>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-base-100 border border-base-200 shadow-sm text-xs sm:text-sm font-semibold text-base-content">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>Verified Proof-of-Display Reports</span>
          </div>
        </div>

        {/* Grid of Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {placements.map((item, idx) => (
            <div
              key={idx}
              className="stagger-child glass-card p-4 sm:p-4.5 rounded-3xl shadow-3d group transition-all duration-500 hover:rotate-y-[-4deg] hover:-translate-y-1.5"
            >
              <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-inner bg-base-300">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-4 px-2 space-y-1">
                <h4 className="font-bold text-lg sm:text-xl text-base-content">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-base-content/60">{item.impressions}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
