"use client";

import React from "react";
import { Rocket, LineChart } from "lucide-react";

export default function VisionAndFeaturesSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (Span 7): Vision Image Card */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden relative min-h-[340px] sm:min-h-[420px] shadow-2xl group border border-base-200">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWyTT2b65XFXrgursc_Rwl6r22sKJrK6zRlTa5lRRVjjxnzFntsRCSnNSJgGnS0eHrhP4yQXClrFEHSgQfTkj-yeylj1DD43oOA00WlJVCFMTA500EMNZwU-xWoAAwsyEari0HG2FNGpFUlDCaRUQpUxjuXn3nkGeeh2RirLkWdCjdX4l3RDzvCYa1Ek4fOB7uhjgNuKvoRXgnUunR1cmfiheOpTwPD8tTUFpiy30kGgvPFdnNCprsGl83ng5hwQL3uoF2bg97BXo"
            alt="Lagos Billboard Landscape Vision"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/90 via-[#0b0f19]/40 to-transparent flex items-end p-6 sm:p-10">
            <div>
              <div className="badge badge-primary text-xs font-bold uppercase tracking-wider mb-2">
                Our Vision
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3">
                Making Ambitious Brands Impossible to Overlook
              </h3>
              <p className="text-white/85 text-sm sm:text-base max-w-lg font-normal leading-relaxed">
                Empowering Nigerian businesses with the complete visibility engine they need to establish market authority — from brand identity and high-speed web presence to prime digital billboard reach.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Span 5): 2 Stacked Feature Cards */}
        <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          {/* Top Card: Rapid Deployment */}
          <div className="bg-base-200 p-6 sm:p-8 rounded-3xl flex-1 border border-base-300 shadow-md hover:shadow-lg transition-all">
            <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-base-content mb-1 sm:mb-2">
              Rapid Speed to Market
            </h3>
            <p className="text-base-content/75 text-xs sm:text-sm leading-relaxed">
              From creative discovery to live high-speed website and active digital billboard broadcasts in 10 to 14 days. Zero freelance lag or finger-pointing.
            </p>
          </div>

          {/* Bottom Card: Unified Visibility ROI */}
          <div className="bg-primary text-primary-content p-6 sm:p-8 rounded-3xl flex-1 shadow-xl hover:shadow-2xl transition-all">
            <LineChart className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
              Measurable Commercial ROI
            </h3>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
              We connect local Google search intent, conversion web funnels, and real-world high-traffic billboard impressions into predictable customer acquisition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
