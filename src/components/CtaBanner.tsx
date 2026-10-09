"use client";

import React from "react";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section id="cta" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-24 perspective-2000">
      <div className="bg-primary rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-16 lg:p-24 text-center text-primary-content relative overflow-hidden shadow-3d group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5 sm:space-y-7 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-primary-content">
            Ready to dominate the <br className="hidden sm:block" />
            outdoor landscape?
          </h2>

          <p className="text-base sm:text-xl text-primary-content/85 max-w-2xl mx-auto font-normal leading-relaxed">
            Join hundreds of advertisers already using Advers to reach millions
            of customers daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-5 justify-center pt-3 sm:pt-4">
            <Link
              href="/signup"
              className="bg-base-100 text-primary hover:bg-base-200 px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl font-extrabold text-base sm:text-lg shadow-3d hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all active:scale-95 text-center"
            >
              Get Started Free
            </Link>

            <Link
              href="/contact"
              className="border border-primary-content/30 backdrop-blur-md text-primary-content px-8 sm:px-10 py-3.5 sm:py-4.5 rounded-2xl font-extrabold text-base sm:text-lg hover:bg-primary-content/10 transition-all text-center"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
