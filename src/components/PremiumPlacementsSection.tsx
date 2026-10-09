"use client";

import React from "react";

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
      impressions: "Premium Retail Crowd • Luxury Aesthetic",
      img: "/portharcourt-mall.png",
    },
  ];

  return (
    <section id="placements" className="py-14 sm:py-24 bg-base-200/40 backdrop-blur-sm border-y border-base-200 perspective-2000">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 preserve-3d">
        <div className="mb-8 sm:mb-12 space-y-2.5 sm:space-y-3 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-base-content">
            Premium Placements
          </h2>
          <p className="text-base sm:text-lg text-base-content/80 max-w-2xl mx-auto font-normal">
            Access the most visible and high-impact locations in the country&apos;s
            business hubs.
          </p>
        </div>

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
