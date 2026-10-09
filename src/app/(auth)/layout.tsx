import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-base-100 text-base-content flex flex-col lg:flex-row transition-colors duration-300">
      {/* Left Column: Full-Height Showcase Panel (Desktop lg+) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative min-h-screen bg-cover bg-center p-12 flex-col justify-between overflow-hidden select-none">
        {/* Background Image & Gradient Overlay */}
        <img
          src="/auth-showcase.jpg"
          alt="Advers Outdoor Billboard Showcase"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/95 via-[#0b0f19]/50 to-[#0b0f19]/20" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-md brightness-110"
            />
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Advers
            </span>
          </Link>
        </div>

        {/* Bottom Hero Caption & Social Proof */}
        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Put Your Brand on <br />
            <span className="text-primary">Every Screen</span>
          </h2>

          <p className="text-white/85 text-base leading-relaxed font-normal">
            Connect with premium billboard networks across Lagos, Abuja, and Port Harcourt. Manage and track your campaigns seamlessly.
          </p>

          <div className="pt-4 border-t border-white/15 flex items-center gap-6 text-xs text-white/80 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>2,000+ Screen Slots</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Real-Time Traffic Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Form Container (No floating card box) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen bg-base-100">
        {/* Top Header Row */}
        <div className="flex justify-between items-center w-full">
          {/* Mobile Logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-extrabold tracking-tight text-base-content">
              Advers
            </span>
          </Link>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        {/* Form Center Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {children}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-base-content/50 pt-4">
          © 2026 Advers Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
