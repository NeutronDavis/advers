"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, Zap, Shield, Crown } from "lucide-react";

export default function PackagesSection() {
  const packages = [
    {
      id: "launchpad",
      name: "Launchpad",
      tagline: "Brand Foundation for Startups & Professionals",
      price: "₦150,000 – ₦200,000",
      featured: false,
      badge: "Starter Foundation",
      icon: <Zap className="w-5 h-5 text-primary" />,
      description: "Establish undeniable corporate credibility from day one so clients take you seriously.",
      includes: [
        "Custom Vector Logo Suite (Primary, icon & dark variants)",
        "Comprehensive Brand Guidelines (Colors, typography, voice)",
        "Corporate Company Profile / Pitch Deck (PDF & editable)",
        "Domain Registration & Business Email (you@company.ng)",
        "Branded Letterhead, Invoice & Business Card Templates",
        "Social Media Launch Kit (Avatars & cover banners)",
      ],
      ctaText: "Choose Launchpad",
    },
    {
      id: "get-visible",
      name: "Get Visible",
      tagline: "Core Digital Engine for Scaling SMEs",
      price: "₦250,000 – ₦450,000",
      featured: true,
      badge: "Most Popular",
      icon: <Shield className="w-5 h-5 text-primary" />,
      description: "Turn your business into a 24/7 lead capture engine that ranks on Google and closes sales.",
      includes: [
        "Everything in Launchpad included",
        "3–5 Page Custom High-Speed Website (Mobile-first)",
        "On-Page SEO & Keyword Ranking for local search",
        "Google Business Profile & Google Maps 5-Star Setup",
        "Interactive WhatsApp Chat & Direct Lead Capture Forms",
        "Google Analytics 4 & Meta Conversion Pixel Tracking",
        "1 Year Cloud Hosting, SSL Certificate & Maintenance",
      ],
      ctaText: "Choose Get Visible",
    },
    {
      id: "market-dominance",
      name: "Market Dominance",
      tagline: "Omnichannel Growth: Web, Email & Billboards",
      price: "₦750,000 – ₦1,500,000+",
      featured: false,
      badge: "Total Omnichannel",
      icon: <Crown className="w-5 h-5 text-secondary" />,
      description: "Total physical and digital brand ubiquity. Be everywhere your highest-value customers look.",
      includes: [
        "Everything in Get Visible included",
        "Advanced Web App, E-commerce, or Booking Portal",
        "Targeted Email Marketing Funnels & Nurture Sequences",
        "Strategic Digital LED Billboard Campaign in Prime Cities",
        "High-Resolution Motion Graphics / Video Ad Production",
        "Real-Time Traffic Impression Reports & Proof of Display",
        "Dedicated Account Growth Lead & Priority Revisions",
      ],
      ctaText: "Choose Market Dominance",
    },
  ];

  return (
    <section id="packages" className="py-16 sm:py-24 max-w-[1240px] mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Visibility Packages</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
          Everything Your Business Needs to Grow, <br className="hidden sm:block" />
          <span className="text-primary">Under One Predictable Investment.</span>
        </h2>

        <p className="text-base sm:text-lg text-base-content/75 max-w-2xl mx-auto leading-relaxed font-normal">
          No scattered invoices or surprise retainer fees. Choose the tier matching your commercial milestone and let Advers handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`card rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              pkg.featured
                ? "bg-base-100 border-2 border-primary shadow-3d ring-4 ring-primary/10"
                : "glass-card shadow-xl border border-base-200 hover:shadow-2xl hover:-translate-y-1"
            }`}
          >
            {pkg.featured && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge badge-primary text-primary-content text-xs font-black uppercase tracking-wider px-4 py-3 shadow-md">
                {pkg.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  pkg.featured ? "bg-primary/15 text-primary" : "bg-base-200 text-base-content/80"
                }`}>
                  {pkg.badge}
                </span>
                <div className="p-2 rounded-xl bg-base-200">
                  {pkg.icon}
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-base-content mt-4">
                {pkg.name}
              </h3>

              <p className="text-xs text-base-content/70 font-medium mt-1">
                {pkg.tagline}
              </p>

              <div className="mt-5 pb-5 border-b border-base-200">
                <div className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  Investment Range
                </div>
                <div className="text-2xl sm:text-3xl font-black text-base-content mt-1">
                  {pkg.price}
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-base-content/80 leading-relaxed font-normal">
                {pkg.description}
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="text-xs font-bold text-base-content uppercase tracking-wider">
                  What&apos;s Included:
                </div>
                {pkg.includes.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-base-content/80">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-base-200">
              <Link
                href="/visibility-journey"
                className={`btn w-full rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                  pkg.featured
                    ? "btn-primary text-primary-content shadow-md"
                    : "btn-outline border-base-300 text-base-content hover:bg-primary hover:text-primary-content hover:border-primary"
                }`}
              >
                <span>{pkg.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
