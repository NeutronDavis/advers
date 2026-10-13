"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Globe, 
  Tv, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  MapPin,
  Clock,
  Layers,
  Zap
} from "lucide-react";
import BackgroundParallax from "@/components/BackgroundParallax";
import SectionAnimator from "@/components/SectionAnimator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const pillars = [
    {
      icon: <Palette className="w-6 h-6 text-primary" />,
      badge: "Pillar 01",
      title: "Undeniable Brand Identity",
      tagline: "Corporate credibility from Day One",
      description:
        "Before your website loads or your ad displays, customers judge your credibility. We build comprehensive corporate identities that command market respect.",
      deliverables: [
        "Primary, responsive & monochrome vector logo suites",
        "Brand style guide (Color harmony, typography, voice)",
        "Executive company profiles & investor-ready pitch decks",
        "Corporate stationery, invoice templates & business cards",
      ],
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      badge: "Pillar 02",
      title: "High-Performance Digital Engine",
      tagline: "24/7 automated lead capture & discovery",
      description:
        "A website shouldn't just be a digital brochure. We engineer lightning-fast digital engines that rank on Google, capture qualified leads, and close sales.",
      deliverables: [
        "3–5 page custom high-speed websites (mobile-first)",
        "Google Business Profile & Google Maps 5-star optimization",
        "Automated WhatsApp lead capture & instant booking forms",
        "Google Analytics 4 & Meta Conversion API tracking",
      ],
    },
    {
      icon: <Tv className="w-6 h-6 text-secondary" />,
      badge: "Pillar 03",
      title: "Real-World Omnichannel Reach",
      tagline: "Total digital and physical presence",
      description:
        "Digital ads get scrolled past. We combine targeted email campaigns with high-impact digital LED billboards in prime locations across Nigeria to make your brand inescapable.",
      deliverables: [
        "Prime LED billboard placements (Lagos, Abuja, Port Harcourt)",
        "High-definition motion graphics & animated video creatives",
        "Strategic cold & warm email marketing funnels",
        "Verified traffic impressions & broadcast proof of display",
      ],
    },
  ];

  const leaders = [
    {
      name: "Olumide Adebayo",
      role: "MANAGING PARTNER & BRAND STRATEGIST",
      bio: "12+ years directing commercial brand positioning and integrated marketing campaigns across West Africa.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqrBVRHOH5WHAEjWnO1Fsl1qAsQBGeG8l1yfUh2sIh81J1QI7FrjcPu2S7NLwY9XJAh8RvEOK92Yw8zjx0K0BAw0PQc3NJ5nrrKbG9WzkeEp10_sRotasSpmRXJPn977ujIwu2xXAXNwdJXZE2gy5x7cGzZPI1UPzaX3MRsMTv4uKlOw5aqag_VYyB7bugh_3vqZEBPDPn-zjqeuuSuv7UAIXwao4aHH0BJjfsypr3Psxnc4EbgI-7vKeA9_RF8oGsAnyBCUZkuU8",
    },
    {
      name: "Amaka Nnaji",
      role: "HEAD OF DIGITAL GROWTH & CAMPAIGNS",
      bio: "Conversion optimization and omnichannel campaign lead, specialized in scalable client acquisition for growing SMEs.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDS2PM_0q5p2aVNPJZHVT-i2fqH7_Sd4acE4dl0XjIk5D2U-fpVb2bQdb8XwKeSQHoQ1UlIAeGt5Fd4vD2dwXxZQ9sSZOv9hzJhJbgx5Zt00MIhr72QCp4ixf4ja8cKsTcvqV8ggVIfu-eKeyGVe-CyrNdG333K1L47ztym_a43fzJkB8cRjISA77LlZPU2C7-g_wa1QCBYEZ2Z5Sc_JKrxtLigSDOzMITfIGsudzX1y2Sg7HPg6dijnGsaof7rm238HrlAdJcqjyc",
    },
    {
      name: "Tunde Bakare",
      role: "HEAD OF MEDIA TECH & WEB ENGINEERING",
      bio: "Full-stack engineer and digital media architect bridging web platforms with programmatic outdoor screen networks.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYj42Fw7QAG0rsY_v3CJJ0OftDdoSLOZ5NF6m9l8MnezGghWKJl71ZeRmFSlZg5RBTfcCiBJbffb5rQTnUaHJxwP1TjY0TrQb9w4x8GB04Vlw1K_ysEDSrLEUaHQy8PRHuZrgOv1U8SP5EQVaGo136PbLRkGNQmXQaFPHTeQpQIcRUhQTKUafDgAlui2DnwVmL1toymeyM5XPXchjL6FKCt-PodBSGZLzpN4GX_FYQRfyabWfYpnaF2URvOv1jFT3n5y_zmwXRPHI",
    },
  ];

  const locations = [
    {
      city: "Lagos",
      desc: "Commercial powerhouse — Lekki Toll, Victoria Island, Ikeja Under-Bridge, & Third Mainland access.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBinEyRLemayIS7CgU2MAxrrwE2BF5T8toOey53WI2tq5NxyDo37BHlhALET-PaDcTy64C6bJI0yRJZx0AmRKuzi7TKSWB6BH4UMllM-xBzO6yBdAXXKDVFadxWekdwsiM1M6A-HzMeGxEUna8MJDmGyL6IXLRO6u5xWgeuNhOx5xV-5tAhKTyKgBRuauocaXG7PcN2rh6gydyUnx9Xaulkmsk03l7imhYdvOEWsKfmaHaSYyrel6OrDA8BGiAYZIYuD_TlD9FZJ6I",
    },
    {
      city: "Abuja",
      desc: "Capital influence — Central Business District, Maitama junctions, & Shehu Shagari Way.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcmY7BCzFtZ9n34tOjH923aX2uDxT5uRs_6xOW3XTrv9QkpmbGB7uIz_oYuJ92stwzzmYbXVaFM4hAzIGbFCy86GN7qfDVfZpTx_WMHW3ScO7vjCC8-MmJnijPIQMRKMQ6bWcAONe3D895TgVon1pBdhhzvoWui2Mps0SRtFB_6UZU81_ULXY0g6yxIg9COyhUk2FYvOQGgGrdAoBcwcso6O4ewqUzF0vY-eWQxkkWq7RCi5CJc8O32fAlUstdBhyrev-iy3VtpD4",
    },
    {
      city: "Port Harcourt",
      desc: "Industrial hub — GRA Junction, Aba Road arterial, & Peter Odili corridor.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL4bGWUNrjSg5vg_hOmQ_xOGCT_B2gKWzYVNPDI3tLp2W0lTWPG6Mw1-t8qIXZlCDnKtl6PqbcE991xZuFBmnI48MrIYFrDbNGn9vjC646w_KXCUE8bKdIFtrnSoOlE3be83T6Wmgm-SOE9mxJBPkA2qaCYSfE1JVxQahsDCaS_dnVTGEtjca0J9HJ6kCTmGNlqlguffWmrkCD9AQ6UeDfv312R3XYcb5XOZU7sWipK3OBgdigc-mjldFeHzGFk-Xu7_KbJr13jFM",
    },
  ];

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex flex-col">
      <BackgroundParallax />
      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Narrative Hero Header */}
        <header className="relative pt-14 sm:pt-24 pb-14 sm:pb-20 overflow-hidden">
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 animate-entrance">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Service Brand Visibility Partner</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-base-content mb-5 sm:mb-6 leading-tight max-w-4xl tracking-tight">
              We Don&apos;t Just Build Assets. <br className="hidden sm:block" />
              <span className="text-primary">We Put Your Brand on the Front Page.</span>
            </h1>

            <p className="text-base sm:text-xl text-base-content/80 max-w-3xl leading-relaxed font-normal">
              Advers bridges the gap between ambitious SMEs and undeniable market authority across Nigeria. 
              By uniting brand identity design, custom web engineering, and high-impact digital LED billboards under one roof, 
              we help growing businesses get seen, get trusted, and dominate their local market.
            </p>
          </div>
        </header>

        {/* The Advers Story Section */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 bg-base-100 relative overflow-hidden border-t border-base-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
              <div className="w-full lg:w-1/2 space-y-5 sm:space-y-6">
                <div className="text-xs font-black uppercase tracking-widest text-primary">
                  The Advers Story
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                  Ending the Frustrating, Fragmented Marketing Trap.
                </h2>

                <div className="space-y-4 sm:space-y-5 text-base-content/80 text-base sm:text-lg leading-relaxed font-normal">
                  <p>
                    For years, growing businesses in Nigeria faced an impossible dilemma. To scale their visibility, they had to coordinate five different disconnected vendors: a freelance graphic designer who didn&apos;t understand marketing, a web developer who delivered broken code with no SEO, a copywriter who vanished mid-project, and billboard brokers who only spoke to multinational budgets.
                  </p>
                  <p>
                    The result? Thousands of hours wasted, mismatched branding, disjointed customer journeys, and zero tangible commercial growth.
                  </p>
                  <p className="font-semibold text-base-content">
                    We built Advers to replace this broken model.
                  </p>
                  <p>
                    Advers gives ambitious businesses an all-in-one visibility engine: corporate brand identity, high-converting digital web presence, and high-visibility physical billboard reach, engineered together as one cohesive, growth-generating package.
                  </p>
                </div>
              </div>

              {/* Native daisyUI Interactive Preview Window */}
              <div className="w-full lg:w-1/2">
                <div className="mockup-browser border border-base-300 bg-base-100 shadow-3d rounded-3xl overflow-hidden">
                  <div className="mockup-browser-toolbar bg-base-200 px-4 py-3 flex items-center justify-between">
                    <div className="input input-sm bg-base-100 text-xs text-base-content/70 flex items-center gap-2 max-w-xs w-full">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      advers.ng/growth-engine
                    </div>
                    <span className="badge badge-primary text-[10px] font-bold">100% UNIFIED</span>
                  </div>

                  <div className="p-6 sm:p-8 bg-base-100 space-y-6">
                    <div className="flex items-center gap-4 pb-5 border-b border-base-200">
                      <img 
                        src="/logo.png" 
                        alt="Advers" 
                        className="h-10 w-auto object-contain"
                      />
                      <div>
                        <h4 className="text-base font-extrabold text-base-content">
                          The Advers Operating Standard
                        </h4>
                        <p className="text-xs text-base-content/70">
                          One partner. One contract. Total market presence.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="stat bg-base-200/60 rounded-2xl p-4">
                        <div className="stat-title text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                          Delivery Timeline
                        </div>
                        <div className="stat-value text-2xl font-black text-primary mt-1">
                          10–14 Days
                        </div>
                        <div className="stat-desc text-[11px] text-base-content/70 mt-1">
                          From brief to live deployment
                        </div>
                      </div>

                      <div className="stat bg-base-200/60 rounded-2xl p-4">
                        <div className="stat-title text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                          Average SME ROI
                        </div>
                        <div className="stat-value text-2xl font-black text-secondary mt-1">
                          4.2x
                        </div>
                        <div className="stat-desc text-[11px] text-base-content/70 mt-1">
                          In inbound leads &amp; deals
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-base-content/90">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Zero freelance hand-offs or technical excuses</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-base-content/90">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Full asset ownership &amp; source vector deliverables</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-base-content/90">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Real-time traffic audit logs for physical placements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionAnimator>

        {/* The 3 Core Pillars Section */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 bg-base-200/50 border-t border-base-200">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>The Advers Methodology</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                  Three Pillars. One Undeniable Brand.
                </h2>

                <p className="text-base sm:text-lg text-base-content/75 font-normal">
                  How Advers turns overlooked businesses into established market authorities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="card bg-base-100 rounded-3xl p-6 sm:p-8 shadow-3d hover:shadow-2xl transition-all border border-base-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="badge badge-primary text-primary-content text-[11px] font-black uppercase tracking-wider px-3 py-2">
                          {pillar.badge}
                        </span>
                        <div className="p-2.5 rounded-xl bg-base-200 group-hover:scale-110 transition-transform">
                          {pillar.icon}
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-base-content">
                        {pillar.title}
                      </h3>

                      <p className="text-xs font-bold text-primary mt-1 mb-4">
                        {pillar.tagline}
                      </p>

                      <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed font-normal mb-6">
                        {pillar.description}
                      </p>

                      <div className="space-y-2.5 pt-4 border-t border-base-200">
                        <div className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                          Key Deliverables:
                        </div>
                        {pillar.deliverables.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-base-content/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4">
                      <Link
                        href="/visibility-journey"
                        className="btn btn-outline btn-sm w-full rounded-xl text-xs font-bold group-hover:btn-primary transition-all"
                      >
                        Explore Package Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionAnimator>

        {/* Our Leadership Section */}
        <SectionAnimator>
          <section className="py-14 sm:py-24 bg-base-100 border-t border-base-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
              <div className="mb-10 sm:mb-14 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-2">
                  Our Leadership
                </h2>
                <p className="text-base-content/80 text-base sm:text-lg font-normal">
                  The multidisciplinary team committed to your business&apos;s commercial growth.
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
          <section className="py-14 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 border-t border-base-200">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
                Deeply Rooted Across Nigeria
              </h2>
              <p className="text-base-content/75 text-sm sm:text-base font-normal">
                High-visibility placements strategically positioned where high-net-worth decisions happen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {locations.map((loc, idx) => (
                <div
                  key={idx}
                  className="stagger-child group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-3d border border-base-300"
                >
                  <img
                    src={loc.img}
                    alt={loc.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6">
                    <div className="inline-flex items-center gap-1.5 text-xs text-primary-content/90 font-bold mb-1">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>Prime Commercial Hub</span>
                    </div>
                    <h4 className="text-white text-xl sm:text-2xl font-black mb-1">
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
            <div className="bg-primary p-6 sm:p-16 lg:p-20 rounded-3xl sm:rounded-[3rem] text-center text-primary-content relative overflow-hidden shadow-3d group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary opacity-90 pointer-events-none" />
              <div className="relative z-10 space-y-5 sm:space-y-6 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to Put Your Brand on the Map?
                </h2>
                <p className="text-white/85 text-base sm:text-lg font-normal leading-relaxed">
                  Join growing Nigerian businesses scaling their authority and customer reach with Advers. Choose a package or speak directly with our strategists.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center pt-3 sm:pt-4">
                  <Link
                    href="/visibility-journey"
                    className="btn btn-neutral bg-base-100 text-primary hover:bg-base-200 border-none py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Explore Visibility Packages
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="btn btn-outline border-white/30 text-white hover:bg-white/15 hover:border-white py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg transition-all text-center"
                  >
                    Talk to Growth Strategists
                  </Link>
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
