"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Megaphone, Sparkles } from "lucide-react";
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
  if (/^https?:\/\//i.test(href)) {
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

      {posts.length === 0 ? (
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
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] flex flex-col"
            >
              {post.imageUrl ? (
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-36 w-full bg-[var(--portal-obsidian-3)] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[var(--portal-gold)]" />
                </div>
              )}

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge badge-xs bg-white/10 border-white/15 text-[var(--portal-gold)] font-bold">
                      Sponsored
                    </span>
                    {post.category && (
                      <span className="text-[9px] text-[var(--portal-obsidian-muted)]">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold mt-1.5">{post.title}</div>
                  <p className="text-[10px] text-[var(--portal-obsidian-muted-2)] line-clamp-2 mt-1">
                    {post.body}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--portal-obsidian-line)]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {post.sponsorLogoUrl ? (
                      <img
                        src={post.sponsorLogoUrl}
                        alt={post.sponsorName}
                        className="w-5 h-5 rounded object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-[var(--portal-gold)] text-[var(--portal-obsidian)] flex items-center justify-center text-[9px] font-black">
                        {post.sponsorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[9px] text-[var(--portal-obsidian-muted)] truncate">
                      {post.sponsorName}
                    </span>
                  </div>
                  {post.ctaUrl && (
                    <CtaLink
                      href={post.ctaUrl}
                      className="text-[10px] font-bold text-[var(--portal-gold)] flex items-center gap-1 shrink-0"
                    >
                      {post.ctaLabel || "Learn more"}
                      <ArrowRight className="w-3 h-3" />
                    </CtaLink>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
