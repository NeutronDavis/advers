"use client";

import React from "react";
import Link from "next/link";
import BackgroundParallax from "@/components/BackgroundParallax";
import SectionAnimator from "@/components/SectionAnimator";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import ModernStandardSection from "@/components/ModernStandardSection";
import PackagesSection from "@/components/PackagesSection";
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

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Hero Section with Page Load Entrance Animation */}
        <Hero />

        {/* Scroll-Driven Section Reveal & Reset Animators */}
        {/* <SectionAnimator>
          <StatsSection />
        </SectionAnimator> */}

        <SectionAnimator>
          <ModernStandardSection />
        </SectionAnimator>

        <SectionAnimator>
          <PackagesSection />
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
