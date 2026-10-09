"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import BackgroundParallax from "@/components/BackgroundParallax";
import SectionAnimator from "@/components/SectionAnimator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const leaders = [
    {
      name: "Olumide Adebayo",
      role: "CHIEF EXECUTIVE OFFICER",
      bio: "Ex-Media Director with 15 years experience in West African advertising logistics.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqrBVRHOH5WHAEjWnO1Fsl1qAsQBGeG8l1yfUh2sIh81J1QI7FrjcPu2S7NLwY9XJAh8RvEOK92Yw8zjx0K0BAw0PQc3NJ5nrrKbG9WzkeEp10_sRotasSpmRXJPn977ujIwu2xXAXNwdJXZE2gy5x7cGzZPI1UPzaX3MRsMTv4uKlOw5aqag_VYyB7bugh_3vqZEBPDPn-zjqeuuSuv7UAIXwao4aHH0BJjfsypr3Psxnc4EbgI-7vKeA9_RF8oGsAnyBCUZkuU8",
    },
    {
      name: "Amaka Nnaji",
      role: "HEAD OF OPERATIONS",
      bio: "Strategy specialist focused on media owner partnerships and inventory expansion.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS2PM_0q5p2aVNPJZHVT-i2fqH7_Sd4acE4dl0XjIk5D2U-fpVb2bQdb8XwKeSQHoQ1UlIAeGt5Fd4vD2dwXxZQ9sSZOv9hzJhJbgx5Zt00MIhr72QCp4ixf4ja8cKsTcvqV8ggVIfu-eKeyGVe-CyrNdG333K1L47ztym_a43fzJkB8cRjISA77LlZPU2C7-g_wa1QCBYEZ2Z5Sc_JKrxtLigSDOzMITfIGsudzX1y2Sg7HPg6dijnGsaof7rm238HrlAdJcqjyc",
    },
    {
      name: "Tunde Bakare",
      role: "CHIEF TECHNOLOGY OFFICER",
      bio: "Architect of the Advers booking engine, previously lead dev at major fintech hubs.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYj42Fw7QAG0rsY_v3CJJ0OftDdoSLOZ5NF6m9l8MnezGghWKJl71ZeRmFSlZg5RBTfcCiBJbffb5rQTnUaHJxwP1TjY0TrQb9w4x8GB04Vlw1K_ysEDSrLEUaHQy8PRHuZrgOv1U8SP5EQVaGo136PbLRkGNQmXQaFPHTeQpQIcRUhQTKUafDgAlui2DnwVmL1toymeyM5XPXchjL6FKCt-PodBSGZLzpN4GX_FYQRfyabWfYpnaF2URvOv1jFT3n5y_zmwXRPHI",
    },
  ];

  const locations = [
    {
      city: "Lagos",
      desc: "The heartbeat of Nigerian commerce.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBinEyRLemayIS7CgU2MAxrrwE2BF5T8toOey53WI2tq5NxyDo37BHlhALET-PaDcTy64C6bJI0yRJZx0AmRKuzi7TKSWB6BH4UMllM-xBzO6yBdAXXKDVFadxWekdwsiM1M6A-HzMeGxEUna8MJDmGyL6IXLRO6u5xWgeuNhOx5xV-5tAhKTyKgBRuauocaXG7PcN2rh6gydyUnx9Xaulkmsk03l7imhYdvOEWsKfmaHaSYyrel6OrDA8BGiAYZIYuD_TlD9FZJ6I",
    },
    {
      city: "Abuja",
      desc: "The administrative center of influence.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcmY7BCzFtZ9n34tOjH923aX2uDxT5uRs_6xOW3XTrv9QkpmbGB7uIz_oYuJ92stwzzmYbXVaFM4hAzIGbFCy86GN7qfDVfZpTx_WMHW3ScO7vjCC8-MmJnijPIQMRKMQ6bWcAONe3D895TgVon1pBdhhzvoWui2Mps0SRtFB_6UZU81_ULXY0g6yxIg9COyhUk2FYvOQGgGrdAoBcwcso6O4ewqUzF0vY-eWQxkkWq7RCi5CJc8O32fAlUstdBhyrev-iy3VtpD4",
    },
    {
      city: "Port Harcourt",
      desc: "The hub of the south-south market.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL4bGWUNrjSg5vg_hOmQ_xOGCT_B2gKWzYVNPDI3tLp2W0lTWPG6Mw1-t8qIXZlCDnKtl6PqbcE991xZuFBmnI48MrIYFrDbNGn9vjC646w_KXCUE8bKdIFtrnSoOlE3be83T6Wmgm-SOE9mxJBPkA2qaCYSfE1JVxQahsDCaS_dnVTGEtjca0J9HJ6kCTmGNlqlguffWmrkCD9AQ6UeDfv312R3XYcb5XOZU7sWipK3OBgdigc-mjldFeHzGFk-Xu7_KbJr13jFM",
    },
  ];

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex flex-col">
      <BackgroundParallax />
      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Narrative Hero Header */}
        <header className="relative pt-12 sm:pt-20 pb-12 sm:pb-20 overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 animate-entrance">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-base-content mb-4 sm:mb-6 leading-tight max-w-4xl tracking-tight">
              About Us
            </h1>
            <p className="text-base sm:text-xl text-base-content/80 max-w-2xl leading-relaxed font-normal">
              Bridging the gap between brand vision and public visibility across
              West Africa. We are the operating system for modern outdoor
              advertising, built for transparency, impact, and speed.
            </p>
          </div>
        </header>

        {/* The Advers Story Section */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 bg-base-100 relative overflow-hidden border-t border-base-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
              <div className="w-full lg:w-1/2 space-y-5 sm:space-y-6">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                  The Advers Story
                </h2>
                <div className="space-y-4 sm:space-y-5 text-base-content/80 text-base sm:text-lg leading-relaxed font-normal">
                  <p>
                    Founded in the heart of Lagos, Advers was born out of a simple
                    frustration: advertising on Nigeria&apos;s massive billboards was
                    a manual, opaque, and fragmented process.
                  </p>
                  <p>
                    We saw billboard owners with unsold inventory and advertisers
                    struggling to find available spaces in key hubs like Ikeja,
                    Maitama, and the Port Harcourt GRA. We set out to build the
                    bridge.
                  </p>
                  <p>
                    By digitizing the inventory of major media owners and creating a
                    transparent booking engine, we&apos;ve enabled businesses of all
                    sizes—from local startups to multinationals—to light up the
                    streets of Nigeria with their message.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-1/2 relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-1 sm:rotate-2 hover:rotate-0 transition-transform duration-500 border border-base-300">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvsjYeiKgxG7o3qR1raK3UK6QX0SfSDsRbQSlyj6KDnsjSRzWmioi4Zh9FS9T8SzAujQ6fXiPHe_mdywenYcFDt55GLrIqPQaxoL-GfT_EVRq78H9w4-CQL43nwI8bzucg39oQG236sgKTPWQCoFUtpTv4dBZrdfQCcBVYSf4e_fsnO6MeEk2ZE1geRGbCCz0lkz3a_p6A0R2o_toeEbU8k7oKNHqvB94Pz0q0fXEWacdDUjIpyQ-0llwQUNgKcA-J-d0Eiwd7Hjc"
                    alt="Advers Modern Office & Analytics"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-4 sm:mt-0 sm:absolute -bottom-6 sm:-bottom-8 -left-2 sm:-left-8 glass-card p-4 sm:p-6 rounded-2xl max-w-xs shadow-3d">
                  <div className="text-primary font-black text-3xl sm:text-5xl mb-1 leading-none">
                    2,000+
                  </div>
                  <div className="w-8 sm:w-10 h-1 bg-primary mb-2 sm:mb-3 rounded-full" />
                  <p className="text-[10px] sm:text-xs font-bold tracking-wider text-base-content/75 uppercase">
                    VERIFIED AD SLOTS ACROSS NIGERIA
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionAnimator>

        {/* Our Leadership Section */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 bg-base-200/50 border-t border-base-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="mb-10 sm:mb-14 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-2">
                  Our Leadership
                </h2>
                <p className="text-base-content/80 text-base sm:text-lg font-normal">
                  The experts driving the future of Nigerian advertising.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {leaders.map((leader, idx) => (
                  <div
                    key={idx}
                    className="stagger-child bg-base-100 p-5 sm:p-6 rounded-3xl shadow-3d hover:shadow-2xl transition-all border border-base-300 group"
                  >
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-5 sm:mb-6 bg-base-300">
                      <img
                        src={leader.img}
                        alt={leader.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-base-content mb-1">
                      {leader.name}
                    </h4>
                    <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2 sm:mb-3">
                      {leader.role}
                    </p>
                    <p className="text-base-content/80 text-xs sm:text-sm leading-relaxed font-normal">
                      {leader.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionAnimator>

        {/* Deeply Rooted Across Nigeria Showcase */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content text-center mb-10 sm:mb-14 tracking-tight">
              Deeply Rooted Across Nigeria
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {locations.map((loc, idx) => (
                <div
                  key={idx}
                  className="stagger-child group cursor-pointer relative overflow-hidden rounded-3xl aspect-[4/3] shadow-3d"
                >
                  <img
                    src={loc.img}
                    alt={loc.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6">
                    <h4 className="text-white text-xl sm:text-2xl font-bold mb-1">
                      {loc.city}
                    </h4>
                    <p className="text-white/80 text-xs sm:text-sm font-normal">
                      {loc.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </SectionAnimator>

        {/* Final CTA Banner */}
        <SectionAnimator>
          <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-20 mb-6 sm:mb-10">
            <div className="bg-[#4f46e5] p-6 sm:p-16 lg:p-20 rounded-3xl sm:rounded-[3rem] text-center text-white relative overflow-hidden shadow-3d group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3525cd] to-[#712ae2] opacity-60 pointer-events-none" />
              <div className="relative z-10 space-y-5 sm:space-y-6 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to Light Up the Streets?
                </h2>
                <p className="text-white/85 text-base sm:text-lg font-normal leading-relaxed">
                  Join hundreds of brands scaling their visibility with Advers.
                  Start booking today.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center pt-3 sm:pt-4">
                  <a
                    href="#contact"
                    className="bg-white text-[#3525cd] py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="#contact"
                    className="bg-white/10 border border-white/30 text-white py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all text-center"
                  >
                    Talk to an Expert
                  </a>
                </div>
              </div>
            </div>
          </section>
        </SectionAnimator>
      </main>

      <Footer />
    </div>
  );
}
