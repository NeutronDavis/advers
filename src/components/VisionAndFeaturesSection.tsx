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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/90 via-[#0b0f19]/30 to-transparent flex items-end p-6 sm:p-10">
            <div>
              <h3 className="text-white text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3">
                Our Vision
              </h3>
              <p className="text-white/85 text-sm sm:text-lg max-w-md font-normal leading-relaxed">
                To become the operating system for Outdoor Advertising in West
                Africa, starting with Nigeria&apos;s most iconic cities.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Span 5): 2 Stacked Feature Cards */}
        <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          {/* Top Card: Fast-Tracking Impact */}
          <div className="bg-base-200 p-6 sm:p-10 rounded-2xl flex-1 border border-base-300 shadow-md hover:shadow-lg transition-all">
            <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-4 sm:mb-5" />
            <h3 className="text-xl sm:text-2xl font-bold text-base-content mb-2 sm:mb-3">
              Fast-Tracking Impact
            </h3>
            <p className="text-base-content/75 text-sm sm:text-base leading-relaxed">
              Reducing booking lead times from weeks to hours through our
              centralized digital platform.
            </p>
          </div>

          {/* Bottom Card: Data-Driven OOH */}
          <div className="bg-primary text-primary-content p-6 sm:p-10 rounded-2xl flex-1 shadow-xl hover:shadow-2xl transition-all">
            <LineChart className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-4 sm:mb-5" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              Data-Driven OOH
            </h3>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              Introducing real-world analytics and impression tracking to
              Nigeria&apos;s billboard ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
