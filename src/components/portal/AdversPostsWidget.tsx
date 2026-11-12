"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Sparkles,
} from "lucide-react";
import type { AdversPostView } from "@/server/data/posts";

function CtaLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function AdversPostsWidget({
  posts,
}: {
  posts: AdversPostView[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = posts.length;
  const activePost = count > 0 ? posts[Math.min(activeIndex, count - 1)] : null;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (count > 0 && activeIndex >= count) {
      setActiveIndex(0);
    }
  }, [activeIndex, count]);

  const goTo = (index: number) => {
    if (count === 0) return;
    setActiveIndex((index + count) % count);
  };

  return (
    <section className="bg-[var(--portal-obsidian)] rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/5 space-y-5">
      <div className="absolute right-[-40px] top-[-60px] w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute right-[-80px] top-[-100px] w-[420px] h-[420px] rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold)] flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            ADVERS POSTS
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            Advertisements on ADVERS
          </h2>
          <p className="text-xs text-[var(--portal-obsidian-muted-2)] mt-1 max-w-xl">
            Discover businesses, products, services and promotional campaigns
            advertised directly inside the ADVERS app.
          </p>
        </div>
        <span className="badge badge-sm bg-white/10 border-white/15 text-[var(--portal-gold)] font-bold self-start sm:self-auto">
          Sponsored content
        </span>
      </div>

      {count === 0 || !activePost ? (
        <div className="relative z-10 p-6 rounded-2xl bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold">Your next customer could be here.</div>
            <p className="text-[11px] text-[var(--portal-obsidian-muted-2)]">
              Sponsored posts from Advers advertisers will appear here.
            </p>
          </div>
          <Link
            href="/portal/explore"
            className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl font-bold text-xs"
          >
            Explore advertising
          </Link>
        </div>
      ) : (
        <div
          className="relative z-10"
          role="region"
          aria-roledescription="carousel"
          aria-label="Sponsored advertisements"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="rounded-3xl overflow-hidden bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[330px] overflow-hidden">
                {activePost.imageUrl ? (
                  <img
                    src={activePost.imageUrl}
                    alt={activePost.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.18),transparent_40%)] bg-[var(--portal-obsidian-3)] flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-10 h-10 text-[var(--portal-gold)] mx-auto" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--portal-gold)] mt-2">
                        Sponsored feature
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[var(--portal-obsidian)]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[var(--portal-obsidian-2)]/30" />

                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="badge badge-sm bg-[var(--portal-obsidian)]/80 border-white/20 text-[var(--portal-gold)] font-bold backdrop-blur-sm">
                    Sponsored
                  </span>
                  {activePost.category && (
                    <span className="badge badge-sm bg-white/10 border-white/15 text-white font-medium backdrop-blur-sm">
                      {activePost.category}
                    </span>
                  )}
                </div>

                {count > 1 && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goTo(activeIndex - 1)}
                      className="btn btn-circle btn-sm bg-[var(--portal-obsidian)]/75 hover:bg-[var(--portal-obsidian)] border-white/20 text-white backdrop-blur-sm"
                      aria-label="Previous advertisement"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(activeIndex + 1)}
                      className="btn btn-circle btn-sm bg-[var(--portal-obsidian)]/75 hover:bg-[var(--portal-obsidian)] border-white/20 text-white backdrop-blur-sm"
                      aria-label="Next advertisement"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-white/80 tabular-nums">
                      {activeIndex + 1} / {count}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {activePost.sponsorLogoUrl ? (
                      <img
                        src={activePost.sponsorLogoUrl}
                        alt={activePost.sponsorName}
                        className="w-7 h-7 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[var(--portal-gold)] text-[var(--portal-obsidian)] flex items-center justify-center text-[11px] font-black">
                        {activePost.sponsorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-[var(--portal-obsidian-muted-2)]">
                      {activePost.sponsorName}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                    {activePost.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--portal-obsidian-muted-2)] leading-relaxed line-clamp-4 whitespace-pre-line">
                    {activePost.body}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--portal-obsidian-line)]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--portal-obsidian-muted)]">
                    <Megaphone className="w-3.5 h-3.5" />
                    Sponsored by {activePost.sponsorName}
                  </div>
                  {activePost.ctaUrl ? (
                    <CtaLink
                      href={activePost.ctaUrl}
                      className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl font-bold text-xs gap-1.5"
                    >
                      {activePost.ctaLabel || "Learn more"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </CtaLink>
                  ) : (
                    <Link
                      href="/portal/explore"
                      className="btn btn-sm bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none rounded-xl font-bold text-xs gap-1.5"
                    >
                      Explore advertising
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {count > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {posts.map((post, index) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show advertisement ${index + 1}: ${post.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-[var(--portal-gold)]"
                      : "w-1.5 bg-white/25 hover:bg-white/45"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
