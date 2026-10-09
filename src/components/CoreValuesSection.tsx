"use client";

import React from "react";
import { Eye, Sparkles, MapPin, Zap } from "lucide-react";

export default function CoreValuesSection() {
  const values = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Transparency",
      desc: "Honest pricing and verified availability for every billboard in our network.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Impact",
      desc: "Strategically placed media that turns heads and drives real business growth.",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Local Innovation",
      desc: "Solutions built specifically for the unique dynamics of the Nigerian market.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Simplicity",
      desc: "Eliminating the red tape. Book, launch, and track in three easy steps.",
    },
  ];

  return (
    <section className="py-14 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="mb-8 sm:mb-14 space-y-2.5 sm:space-y-3 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
          Our Core Values
        </h2>
        <p className="text-base sm:text-lg text-base-content/80 max-w-2xl mx-auto font-normal">
          The principles that drive our mission to revolutionize outdoor
          advertising.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {values.map((v, idx) => (
          <div
            key={idx}
            className="stagger-child group hover:-translate-y-2 transition-transform duration-300 bg-base-100 sm:bg-transparent p-5 sm:p-0 rounded-2xl border border-base-200 sm:border-none shadow-sm sm:shadow-none"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-base-200 text-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-primary-content transition-colors shadow-sm border border-base-300">
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
