"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers,
  Compass,
  Sparkles,
  Users,
  Wallet,
  Headphones,
  Bell,
  Search,
  Plus,
  LogOut,
  CreditCard,
  Building2,
  UserCog,
  Briefcase,
  BarChart3,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useCampaign } from "@/context/CampaignContext";
import CampaignCreateModal from "@/components/portal/CampaignCreateModal";
import { logoutAction } from "@/server/actions/auth";
import type { AuthSessionUser } from "@/lib/types/dto";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function PortalShell({
  user,
  children,
}: {
  user: AuthSessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { openCreateModal, toastMessage, showToast } = useCampaign();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const workspaceNav = [
    { label: "Overview", href: "/portal/dashboard", icon: Home },
    { label: "My campaigns", href: "/portal/campaigns", icon: Layers },
    { label: "Reports", href: "/portal/reports", icon: BarChart3 },
    { label: "Explore advertising", href: "/portal/explore", icon: Compass },
    { label: "AdBoosters", href: "/portal/adboosters", icon: Sparkles },
    { label: "Influencer hub", href: "/portal/influencers", icon: Users },
    { label: "Booster jobs", href: "/portal/booster-jobs", icon: Briefcase },
    { label: "Business profiles", href: "/portal/business-profiles", icon: Building2 },
  ];

  const manageNav = [
    { label: "Billing & plan", href: "/portal/billing", icon: CreditCard },
    { label: "Team & access", href: "/portal/team", icon: UserCog },
    { label: "Wallet & payments", href: "/portal/wallet", icon: Wallet },
    { label: "Help & support", href: "/portal/support", icon: Headphones },
  ];

  const mobileDockTabs = [
    { label: "Home", href: "/portal/dashboard", icon: Home },
    { label: "Campaigns", href: "/portal/campaigns", icon: Layers },
    {
      label: "Create",
      href: "#create",
      icon: Plus,
      isAction: true,
    },
    { label: "Explore", href: "/portal/explore", icon: Compass },
    { label: "Wallet", href: "/portal/wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[var(--portal-bg)] text-[var(--portal-ink)] flex flex-col md:flex-row antialiased transition-colors duration-300">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[var(--portal-obsidian)] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR (>= md) - Matching Screenshot Obsidian Black */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--portal-obsidian)] text-white shrink-0 sticky top-0 h-screen justify-between z-30 p-5 border-r border-[var(--portal-obsidian-3)]">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Header */}
          <Link href="/portal/dashboard" className="flex items-center gap-3 px-2 py-1 group">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
            />
            <div>
              <span className="font-extrabold text-base tracking-widest text-white block">
                ADVERS
              </span>
              <span className="text-[9px] font-bold text-[var(--portal-obsidian-muted)] tracking-wider block">
                UNLIMITED VISIBILITY
              </span>
            </div>
          </Link>

          {/* Workspace Nav Section */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[var(--portal-obsidian-muted-3)] uppercase tracking-wider px-3 mb-2">
              Workspace
            </div>
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    active
                      ? "bg-[var(--portal-obsidian-3)] text-white font-bold shadow-xs"
                      : "text-[var(--portal-obsidian-muted-2)] hover:bg-[var(--portal-obsidian-2)] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[var(--portal-gold)]" : "text-[var(--portal-obsidian-muted-2)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Manage Nav Section */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-bold text-[var(--portal-obsidian-muted-3)] uppercase tracking-wider px-3 mb-2">
              Manage
            </div>
            {manageNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    active
                      ? "bg-[var(--portal-obsidian-3)] text-white font-bold"
                      : "text-[var(--portal-obsidian-muted-2)] hover:bg-[var(--portal-obsidian-2)] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[var(--portal-gold)]" : "text-[var(--portal-obsidian-muted-2)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Growth Callout */}
        <div className="pt-4 space-y-3">
          <div className="bg-[var(--portal-obsidian-2)] border border-[var(--portal-obsidian-line)] rounded-2xl p-4 text-white space-y-2">
            <div className="text-xs font-bold leading-snug">
              Ready to grow your brand?
            </div>
            <p className="text-[11px] text-[var(--portal-obsidian-muted)] leading-relaxed">
              Turn your next big idea into a campaign people can discover.
            </p>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="btn w-full bg-[var(--portal-gold)] hover:bg-[var(--portal-gold-hover)] text-[var(--portal-obsidian)] border-none font-extrabold text-xs rounded-xl shadow-md py-2.5 h-auto min-h-0"
            >
              ＋ Create a campaign
            </button>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-2 text-[var(--portal-obsidian-muted-2)] hover:text-white text-[11px] font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </form>

          <div className="flex items-center justify-between px-2 pt-2 text-[var(--portal-obsidian-muted-3)] text-[11px]">
            <span>ADVERS v2.4</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* DESKTOP TOPBAR (>= md) */}
        <header className="hidden md:flex items-center justify-between h-[72px] bg-[var(--portal-surface)] border-b border-[var(--portal-line)] px-8 sticky top-0 z-20">
          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[var(--portal-icon)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, channels, media..."
              className="input input-sm w-full bg-[var(--portal-soft)] border-[var(--portal-line)] rounded-xl pl-9 text-xs focus:outline-none focus:border-[var(--portal-gold)]"
            />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/booster/notifications"
              className="btn btn-ghost btn-circle btn-sm text-[var(--portal-body)] bg-[var(--portal-soft)] border border-[var(--portal-line)]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-3 pl-2 border-l border-[var(--portal-line)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--portal-avatar-bg)] text-[var(--portal-avatar-ink)] font-black text-xs flex items-center justify-center">
                {initials(user.name)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[var(--portal-ink)] leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-[var(--portal-muted)] font-medium">
                  {user.role === "CLIENT" ? "Advertiser account" : "Advers team"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE TOPBAR (< md) - Clean, Clutter-Free */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-[var(--portal-surface)] border-b border-[var(--portal-line)] sticky top-0 z-20">
          <Link href="/portal/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-7 w-auto object-contain"
            />
            <div>
              <span className="font-black text-sm tracking-widest text-[var(--portal-obsidian)] block leading-none">
                ADVERS
              </span>
              <span className="text-[8px] font-bold text-[var(--portal-muted)] tracking-wider block mt-0.5">
                UNLIMITED VISIBILITY
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="btn btn-ghost btn-circle btn-sm bg-[var(--portal-soft)] text-[var(--portal-body)]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[var(--portal-avatar-bg)] text-[var(--portal-avatar-ink)] font-bold text-xs flex items-center justify-center">
              {initials(user.name)}
            </div>
          </div>
        </header>

        {/* Expandable Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden p-3 bg-[var(--portal-surface)] border-b border-[var(--portal-line)] animate-fadeIn">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--portal-icon)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search campaigns, channels..."
                className="input input-sm w-full bg-[var(--portal-soft)] border-[var(--portal-line)] rounded-xl pl-9 text-xs"
              />
            </div>
          </div>
        )}

        {/* PAGE CONTENT WRAPPER */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM DOCK (daisyUI 5 dock component) */}
      <nav
        aria-label="Mobile Navigation"
        className="dock dock-md md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--portal-surface)] backdrop-blur-xl border-t border-[var(--portal-line)] shadow-2xl py-1 pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        {mobileDockTabs.map((tab) => {
          const Icon = tab.icon;
          const active = !tab.isAction && pathname === tab.href;

          if (tab.isAction) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => openCreateModal()}
                className="flex flex-col items-center justify-center text-[var(--portal-obsidian)]"
              >
                <div className="w-10 h-10 -mt-3.5 rounded-full bg-[var(--portal-gold)] text-[var(--portal-obsidian)] flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="dock-label text-[10px] font-black text-[var(--portal-obsidian)] mt-0.5">
                  Create
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center justify-center ${
                active ? "dock-active text-[var(--portal-gold-ink)] font-bold" : "text-[var(--portal-muted)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="dock-label text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* GLOBAL CAMPAIGN CREATION MODAL */}
      <CampaignCreateModal />
    </div>
  );
}
