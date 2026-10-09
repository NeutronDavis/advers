"use client";

import React from "react";
import { BarChart2, ShieldCheck } from "lucide-react";

export default function ModernStandardSection() {
  return (
    <section id="about" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-24 perspective-2000">
      <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 preserve-3d">
        {/* Left Column */}
        <div className="w-full lg:w-1/2 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content leading-tight">
            The Modern Standard for OOH Advertising
          </h2>
          <p className="text-base sm:text-lg text-base-content/80 leading-relaxed font-normal">
            We&apos;ve removed the complexity from billboard advertising. Browse
            an interactive map of hundreds of premium locations, filter by city,
            and find the exact audience you need without the paperwork.
          </p>

          <div className="pt-2 sm:pt-4 space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-3.5 sm:gap-4 glass-card p-3.5 sm:p-4.5 rounded-2xl shadow-3d hover:shadow-xl transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-sm sm:text-base text-base-content">
                Verified real-time traffic data
              </span>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 glass-card p-3.5 sm:p-4.5 rounded-2xl shadow-3d hover:shadow-xl transition-all">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-sm sm:text-base text-base-content">
                Live campaign compliance tracking
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Real Lagos Billboard Image */}
        <div className="w-full lg:w-1/2 group preserve-3d">
          <div className="rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-3d border border-base-300 transform transition-transform duration-700 group-hover:rotate-y-[8deg] group-hover:rotate-x-[4deg]">
            <img
              src="/lagos-billboard.png"
              alt="Lagos Roadside Digital Billboard"
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
