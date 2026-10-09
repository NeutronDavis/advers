"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import BackgroundParallax from "@/components/BackgroundParallax";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VisibilityJourneyPage() {
  const [selectedPlan, setSelectedPlan] = useState("Look Professional");

  const packages = [
    {
      id: "get-visible",
      name: "Get Visible",
      tagline: "For individuals and people just getting started",
      price: "₦150,000 – ₦200,000",
      featured: false,
      badge: "Starter Tier",
      description: "Establish your fundamental web identity and make sure people can easily discover and reach you.",
      includes: [
        "1-page professional website",
        "Custom domain — 1 year included",
        "1 professional business email account",
        "Basic brand logo design",
        "Mobile-responsive layout",
        "About, services/skills & contact sections",
        "Social media links integration",
        "WhatsApp contact button",
        "Basic SEO setup & search indexing",
        "Complete website deployment & hosting",
      ],
    },
    {
      id: "look-professional",
      name: "Look Professional",
      tagline: "For professionals, personal brands and small businesses",
      price: "₦250,000 – ₦350,000",
      featured: true,
      badge: "Most Popular",
      description: "Build deep credibility and a commanding online presence that turns visitors into paying clients.",
      includes: [
        "Everything in Get Visible",
        "3–5 page custom website",
        "Professional logo design suite",
        "Brand color palette & typography selection",
        "Mini brand guidelines document",
        "Up to 3 business email accounts",
        "Social media profile setup & cover designs",
        "Google Business Profile setup & local maps",
        "Contact & lead capture form",
        "Basic analytics setup",
        "Basic on-page SEO optimization",
        "Professional company profile PDF",
      ],
    },
    {
      id: "launch-ready",
      name: "Launch Ready",
      tagline: "For startups and upcoming companies",
      price: "₦450,000 – ₦650,000",
      featured: false,
      badge: "Startup Growth",
      description: "A complete commercial identity system designed for startups pitching to investors and entering competitive markets.",
      includes: [
        "Everything in Look Professional",
        "5–8 page comprehensive website",
        "Complete starter brand identity & guidelines",
        "Logo variations (light/dark/monochrome)",
        "Social media brand kit & templates",
        "Up to 5 business email accounts",
        "Multi-step contact and lead forms",
        "WhatsApp & Google Maps integration",
        "Full analytics dashboard setup",
        "Branded email signature & website favicon",
        "Basic branded collateral assets",
      ],
    },
    {
      id: "build-authority",
      name: "Build Authority",
      tagline: "For established and growing companies",
      price: "₦750,000 – ₦1,200,000+",
      featured: false,
      badge: "Market Leader",
      description: "Dominant brand presence, thought-leadership hub, and comprehensive conversion optimization.",
      includes: [
        "Everything in Launch Ready",
        "8–15 page bespoke website with Advanced UI/UX",
        "Full brand identity system & pitch deck",
        "Blog or news section",
        "Advanced SEO setup + Google Search Console",
        "Lead-generation forms & newsletter integration",
        "10–15 branded social media designs",
        "Team business email setup & onboarding",
        "Website performance & speed optimization",
        "3 months comprehensive website maintenance",
      ],
    },
    {
      id: "digital-ecosystem",
      name: "Digital Ecosystem",
      tagline: "For companies that need more than a website",
      price: "₦1,500,000+",
      featured: false,
      badge: "Enterprise",
      description: "Full-scale custom digital infrastructure, customer portals, billing, and workflow automation.",
      includes: [
        "Complete enterprise brand identity",
        "Corporate website + Customer Portal",
        "Admin dashboard & operational control",
        "E-commerce & booking system",
        "Payment gateway integration (Paystack / Flutterwave)",
        "CRM & email automation integration",
        "Advanced SEO, analytics & custom web applications",
        "Social media infrastructure & domain hosting",
        "Full API integrations & ongoing maintenance",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex flex-col transition-colors duration-300">
      <BackgroundParallax />
      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Header Hero */}
        <section className="pt-10 sm:pt-12 pb-14 sm:pb-20 bg-gradient-to-b from-primary/10 via-base-100 to-base-100 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-base-content tracking-tight leading-[1.1]">
              The Visibility Journey
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed font-normal">
              You have a great idea. Now let&apos;s make sure people can find it.
              We help individuals, startups, and growing businesses build the
              digital presence they need to be seen, trusted, and taken
              seriously.
            </p>

            {/* Stepper bar */}
            <div className="mt-8 sm:mt-12 max-w-4xl mx-auto overflow-x-auto py-2 px-2">
              <div className="flex items-center justify-between min-w-[620px] p-3.5 sm:p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-3d">
                {[
                  "Get Visible",
                  "Look Professional",
                  "Launch Ready",
                  "Build Authority",
                  "Digital Ecosystem",
                ].map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#eaedff] text-[#3525cd] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-[#131b2e] whitespace-nowrap">
                        {step}
                      </span>
                    </div>
                    {idx < 4 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Packages Cards */}
        <section className="py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content">
                Choose where you are. We&apos;ll help you get where you&apos;re going.
              </h2>
              <p className="mt-2.5 sm:mt-3 text-base-content/70 text-sm sm:text-base font-normal">
                Suggested investment frameworks tailored for your commercial milestone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    pkg.featured
                      ? "bg-base-100 border-2 border-primary shadow-3d ring-4 ring-primary/10"
                      : "glass-card shadow-3d hover:shadow-2xl border border-base-200"
                  }`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 sm:px-4 py-1 rounded-full shadow-md">
                      {pkg.badge}
                    </div>
                  )}

                  <div>
                    {!pkg.featured && (
                      <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">
                        {pkg.badge}
                      </span>
                    )}

                    <h3 className="text-xl sm:text-2xl font-extrabold text-base-content mt-3">
                      {pkg.name}
                    </h3>

                    <p className="text-xs text-base-content/60 font-medium mt-1">
                      {pkg.tagline}
                    </p>

                    <div className="mt-5 sm:mt-6 pb-5 sm:pb-6 border-b border-base-200">
                      <div className="text-[10px] sm:text-xs font-bold text-base-content/50 uppercase tracking-wider">
                        Suggested Investment
                      </div>
                      <div className="text-xl sm:text-3xl font-extrabold text-base-content mt-1">
                        {pkg.price}
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-base-content/70 leading-relaxed font-normal">
                      {pkg.description}
                    </p>

                    <div className="mt-5 sm:mt-6 space-y-2.5">
                      <div className="text-xs font-bold text-base-content uppercase tracking-wider">
                        Includes:
                      </div>
                      {pkg.includes.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-base-content/80">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-base-200">
                    <a
                      href="#inquire"
                      onClick={() => setSelectedPlan(pkg.name)}
                      className={`btn w-full rounded-xl text-sm font-bold h-11 ${
                        pkg.featured
                          ? "btn-primary text-primary-content shadow-md border-none"
                          : "btn-outline border-base-300 text-base-content hover:bg-primary hover:text-primary-content hover:border-primary"
                      }`}
                    >
                      Select {pkg.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Website Care Plan section */}
            <div className="mt-12 sm:mt-16 bg-base-200/50 rounded-3xl p-6 sm:p-12 border border-base-200 shadow-3d">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                    Optional Ongoing Support
                  </span>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-base-content">
                    Website Care Plan
                  </h3>
                  <p className="text-base-content/75 text-xs sm:text-sm leading-relaxed font-normal">
                    Domains, hosting, and business email can be included for the
                    first year where applicable. Renewals and ongoing care keep your
                    site updated, fast, and protected.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                    {[
                      "Website content updates",
                      "Security and dependency updates",
                      "Automated backups",
                      "24/7 uptime monitoring",
                      "Minor design adjustments",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-base-content/80">
                        <Check className="w-4 h-4 text-success shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-base-100 p-5 sm:p-6 rounded-2xl border border-base-200 text-center flex flex-col justify-center items-center">
                  <div className="text-[10px] sm:text-xs font-bold text-base-content/50 uppercase tracking-wider">
                    Suggested Investment
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-base-content mt-1 sm:mt-2">
                    ₦25,000 <span className="text-xs sm:text-sm font-semibold text-base-content/60">/ month</span>
                  </div>
                  <div className="text-xs font-semibold text-primary mt-1">
                    or ₦250,000 / year (Save ₦50,000)
                  </div>
                  <a
                    href="#inquire"
                    onClick={() => setSelectedPlan("Website Care Plan")}
                    className="btn btn-primary text-primary-content text-xs font-bold rounded-xl mt-4 sm:mt-5 w-full border-none shadow-md h-11"
                  >
                    Add Care Plan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Features grid */}
        <section className="py-10 sm:py-14 bg-base-200/50 border-y border-base-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-3xl font-extrabold text-base-content text-center mb-6 sm:mb-8">
              What does it mean to be visible?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                "A professional website",
                "A recognizable brand",
                "A business domain",
                "Professional email",
                "Searchable online presence",
                "Professional social profiles",
                "A digital home for business",
                "Readiness for opportunities",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl bg-base-100 border border-base-200 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-base-content"
                >
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
