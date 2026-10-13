"use client";

import React from "react";
import { Layers, Zap, Shield, TrendingUp, Sparkles } from "lucide-react";

export default function CoreValuesSection() {
  const values = [
    {
      icon: <Layers className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Omnichannel Cohesion",
      desc: "Every touchpoint—from your logo to your website and billboard—speaks with one authoritative voice.",
    },
    {
      icon: <Zap className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Speed to Market",
      desc: "Eliminating months of agency bureaucracy. We launch complete brand foundations and campaigns in days.",
    },
    {
      icon: <Shield className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Radical Transparency",
      desc: "Predictable package pricing, zero hidden retainers, and verified analytics for every campaign dollar.",
    },
    {
      icon: <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8" />,
      title: "Tangible ROI",
      desc: "We don't build vanity assets. We engineer high-converting digital engines and placements that drive real revenue.",
    },
  ];

  return (
    <section className="py-14 sm:py-24 max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="mb-10 sm:mb-14 space-y-2.5 sm:space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Advers Standard</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content tracking-tight">
          How We Deliver Unmatched Brand Authority
        </h2>
        
        <p className="text-base sm:text-lg text-base-content/80 font-normal leading-relaxed">
          The core principles that drive our mission to make growing Nigerian businesses impossible to ignore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {values.map((v, idx) => (
          <div
            key={idx}
            className="stagger-child group hover:-translate-y-2 transition-transform duration-300 bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm hover:shadow-xl hover:border-primary/30"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-content transition-colors shadow-sm">
              {v.icon}
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-base-content mb-1.5 sm:mb-2">{v.title}</h4>
            <p className="text-base-content/75 text-xs sm:text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
