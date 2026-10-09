"use client";

import React from "react";
import Link from "next/link";
import BackgroundParallax from "@/components/BackgroundParallax";
import SectionAnimator from "@/components/SectionAnimator";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import ModernStandardSection from "@/components/ModernStandardSection";
import PremiumPlacementsSection from "@/components/PremiumPlacementsSection";
import VisionAndFeaturesSection from "@/components/VisionAndFeaturesSection";
import CoreValuesSection from "@/components/CoreValuesSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex flex-col transition-colors duration-300">
      {/* Scroll-Driven Floating Parallax Background Elements */}
      <BackgroundParallax />

      {/* Top Banner for PDF Visibility Journey */}
      {/* <div className="relative z-[101] bg-gradient-to-r from-[#131b2e] via-[#3525cd] to-[#712ae2] text-white text-xs font-semibold py-2.5 px-6 text-center flex items-center justify-center gap-2">
        <span className="text-slate-100">
          Looking for web presence &amp; brand packages?
        </span>
        <Link
          href="/visibility-journey"
          className="text-white underline font-bold hover:text-indigo-200 inline-flex items-center gap-1 ml-1"
        >
          Explore The Visibility Journey
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div> */}

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Hero Section with Page Load Entrance Animation */}
        <Hero />

        {/* Scroll-Driven Section Reveal & Reset Animators */}
        <SectionAnimator>
          <StatsSection />
        </SectionAnimator>

        <SectionAnimator>
          <ModernStandardSection />
        </SectionAnimator>

        <SectionAnimator>
          <PremiumPlacementsSection />
        </SectionAnimator>

        <SectionAnimator>
          <VisionAndFeaturesSection />
        </SectionAnimator>

        <SectionAnimator>
          <CoreValuesSection />
        </SectionAnimator>

        <SectionAnimator>
          <CtaBanner />
        </SectionAnimator>
      </main>

      <Footer />
    </div>
  );
}
