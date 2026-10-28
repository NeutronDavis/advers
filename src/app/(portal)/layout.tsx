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
  ArrowRight,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { CampaignProvider, useCampaign } from "@/context/CampaignContext";
import CampaignCreateModal from "@/components/portal/CampaignCreateModal";

function PortalLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openCreateModal, toastMessage, showToast } = useCampaign();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const workspaceNav = [
    { label: "Overview", href: "/portal/dashboard", icon: Home },
    { label: "My campaigns", href: "/portal/campaigns", icon: Layers },
    { label: "Explore advertising", href: "/portal/explore", icon: Compass },
    { label: "AdBoosters", href: "/portal/adboosters", icon: Sparkles },
    { label: "Influencer hub", href: "/portal/influencers", icon: Users },
  ];

  const manageNav = [
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
    <div className="min-h-screen bg-[#f5f6f8] text-[#15171b] flex flex-col md:flex-row antialiased">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#101113] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR (>= md) - Matching Screenshot Obsidian Black */}
      <aside className="hidden md:flex flex-col w-64 bg-[#101113] text-white shrink-0 sticky top-0 h-screen justify-between z-30 p-5 border-r border-[#26272b]">
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
              <span className="text-[9px] font-bold text-[#a5a6ab] tracking-wider block">
                UNLIMITED VISIBILITY
              </span>
            </div>
          </Link>

          {/* Workspace Nav Section */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#747780] uppercase tracking-wider px-3 mb-2">
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
                      ? "bg-[#26272b] text-white font-bold shadow-xs"
                      : "text-[#b8bac0] hover:bg-[#1c1d20] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[#e8b64b]" : "text-[#b8bac0]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Manage Nav Section */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-bold text-[#747780] uppercase tracking-wider px-3 mb-2">
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
                      ? "bg-[#26272b] text-white font-bold"
                      : "text-[#b8bac0] hover:bg-[#1c1d20] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[#e8b64b]" : "text-[#b8bac0]"
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
          <div className="bg-[#1c1d20] border border-[#303136] rounded-2xl p-4 text-white space-y-2">
            <div className="text-xs font-bold leading-snug">
              Ready to grow your brand?
            </div>
            <p className="text-[11px] text-[#a6a8af] leading-relaxed">
              Turn your next big idea into a campaign people can discover.
            </p>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="btn w-full bg-[#e8b64b] hover:bg-[#d6a53b] text-[#101113] border-none font-extrabold text-xs rounded-xl shadow-md py-2.5 h-auto min-h-0"
            >
              ＋ Create a campaign
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-[#747780] text-[11px]">
            <span>ADVERS v2.4</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* DESKTOP TOPBAR (>= md) */}
        <header className="hidden md:flex items-center justify-between h-[72px] bg-white border-b border-[#e8e9ed] px-8 sticky top-0 z-20">
          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[#858993] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, channels, media..."
              className="input input-sm w-full bg-[#f8f9fa] border-[#e8e9ed] rounded-xl pl-9 text-xs focus:outline-none focus:border-[#d6b65f]"
            />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => showToast("You're all caught up with notifications!")}
              className="btn btn-ghost btn-circle btn-sm text-[#4d5159] bg-[#f8f9fa] border border-[#e8e9ed]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-[#e8e9ed]">
              <div className="w-9 h-9 rounded-xl bg-[#f4dfb1] text-[#644514] font-black text-xs flex items-center justify-center">
                PK
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#15171b] leading-tight">
                  Welcome back
                </div>
                <div className="text-[10px] text-[#7c818b] font-medium">
                  Advertiser account
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MOBILE TOPBAR (< md) - Clean, Clutter-Free */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-[#e8e9ed] sticky top-0 z-20">
          <Link href="/portal/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-7 w-auto object-contain"
            />
            <div>
              <span className="font-black text-sm tracking-widest text-[#101113] block leading-none">
                ADVERS
              </span>
              <span className="text-[8px] font-bold text-[#7c818b] tracking-wider block mt-0.5">
                UNLIMITED VISIBILITY
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="btn btn-ghost btn-circle btn-sm bg-[#f8f9fa] text-[#4d5159]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#f4dfb1] text-[#644514] font-bold text-xs flex items-center justify-center">
              PK
            </div>
          </div>
        </header>

        {/* Expandable Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden p-3 bg-white border-b border-[#e8e9ed] animate-fadeIn">
            <div className="relative">
              <Search className="w-4 h-4 text-[#858993] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search campaigns, channels..."
                className="input input-sm w-full bg-[#f8f9fa] border-[#e8e9ed] rounded-xl pl-9 text-xs"
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
        className="dock dock-md md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#e8e9ed] shadow-2xl py-1 pb-[max(6px,env(safe-area-inset-bottom))]"
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
                className="flex flex-col items-center justify-center text-[#101113]"
              >
                <div className="w-10 h-10 -mt-3.5 rounded-full bg-[#e8b64b] text-[#101113] flex items-center justify-center shadow-lg shadow-[#e8b64b]/30">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="dock-label text-[10px] font-black text-[#101113] mt-0.5">
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
                active ? "dock-active text-[#8b6416] font-bold" : "text-[#898d95]"
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

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CampaignProvider>
      <PortalLayoutInner>{children}</PortalLayoutInner>
    </CampaignProvider>
  );
}
