"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  UserCircle,
  Bell,
  Wallet,
  Users,
  ArrowLeft,
  LogOut,
  Sparkles,
  SlidersHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
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

export default function BoosterShell({
  user,
  hasProfile,
  unreadNotifications,
  children,
}: {
  user: AuthSessionUser;
  hasProfile: boolean;
  unreadNotifications: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/booster", icon: LayoutDashboard },
    { name: "Marketplace", href: "/booster/jobs", icon: Compass },
    { name: "My applications", href: "/booster/applications", icon: ClipboardList },
    { name: "My team", href: "/booster/team", icon: Users },
    { name: "Earnings", href: "/booster/earnings", icon: Wallet },
    { name: "My profile", href: "/booster/profile", icon: UserCircle },
    { name: "Verification", href: "/booster/verification", icon: ShieldCheck },
    {
      name: "Notifications",
      href: "/booster/notifications",
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
  ];

  const mobileDock = [
    { name: "Home", href: "/booster", icon: LayoutDashboard },
    { name: "Jobs", href: "/booster/jobs", icon: Compass },
    { name: "Applications", href: "/booster/applications", icon: ClipboardList },
    { name: "Profile", href: "/booster/profile", icon: UserCircle },
    {
      name: "Alerts",
      href: "/booster/notifications",
      icon: Bell,
      badge: unreadNotifications,
    },
  ];

  const active = (href: string) =>
    href === "/booster" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-base-100/90 border-b border-base-200 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/booster" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Advers Logo" className="h-7 w-auto object-contain" />
          <div>
            <span className="font-extrabold text-sm tracking-tight block leading-none">
              ADVERS BOOSTERS
            </span>
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider block mt-0.5">
              One network. Thousands of opportunities.
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-square btn-ghost btn-sm"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-200/95 border-r border-base-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link href="/booster" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Advers Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight block leading-tight">
                  ADVERS
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Boosters
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-base-content/60 hover:text-base-content"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 bg-base-100 rounded-2xl border border-base-300/50 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs shrink-0">
                {initials(user.name)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold truncate">{user.name}</div>
                <div className="text-[10px] text-base-content/60">
                  {hasProfile ? "Booster profile active" : "Booster onboarding"}
                </div>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ring-4 ${
                hasProfile
                  ? "bg-success ring-success/20"
                  : "bg-warning ring-warning/20"
              }`}
            />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider px-3 mb-2">
              Booster workspace
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = active(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? "bg-primary text-primary-content font-bold shadow-md"
                      : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`badge badge-xs font-bold ${
                        isActive ? "bg-white text-primary" : "badge-warning badge-soft"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {!hasProfile && (
            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Create your Booster profile
              </div>
              <p className="text-[11px] text-base-content/60">
                Add your categories, coverage and portfolio to start applying for
                paid marketing work.
              </p>
              <Link
                href="/booster/profile"
                className="btn btn-primary btn-xs w-full rounded-lg font-bold"
              >
                Complete profile
              </Link>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-base-300/50 space-y-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn btn-ghost btn-sm w-full justify-start text-xs font-bold text-base-content/70 hover:text-error rounded-xl gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-base-content/40 font-mono">
              ADVERS BOOSTERS
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile dock */}
      <nav
        aria-label="Booster Navigation"
        className="dock dock-md lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-xl border-t border-base-200 shadow-2xl py-1 pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        {mobileDock.map((tab) => {
          const Icon = tab.icon;
          const isActive = active(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center ${
                isActive ? "dock-active text-primary font-bold" : "text-base-content/60"
              }`}
            >
              <span className="indicator">
                <Icon className="w-5 h-5" />
                {tab.badge ? (
                  <span className="badge badge-xs badge-warning indicator-item">
                    {tab.badge}
                  </span>
                ) : null}
              </span>
              <span className="dock-label text-[10px]">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
