"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Tv,
  Camera,
  Sparkles,
  Receipt,
  Users,
  SlidersHorizontal,
  X,
  LogOut,
  Bell,
  ChevronRight,
  Radio,
  FileCheck,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation: SidebarItem[] = [
    { name: "Operations Cockpit", href: "/admin", icon: LayoutDashboard },
    {
      name: "Campaign Moderation",
      href: "/admin/moderation",
      icon: ShieldCheck,
      badge: "3 New",
    },
    { name: "Media Inventory", href: "/admin/inventory", icon: Tv },
    { name: "Proof of Performance", href: "/admin/pop", icon: FileCheck },
    { name: "AdBoosters Network", href: "/admin/adboosters", icon: Sparkles },
    { name: "Escrow & Settlements", href: "/admin/finance", icon: Receipt },
    { name: "Users & Advertisers", href: "/admin/users", icon: Users },
  ];

  const mobileDockTabs = [
    { name: "Cockpit", href: "/admin", icon: LayoutDashboard },
    { name: "Moderation", href: "/admin/moderation", icon: ShieldCheck, badge: "3" },
    { name: "Inventory", href: "/admin/inventory", icon: Tv },
    { name: "Finance", href: "/admin/finance", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-base-100/90 border-b border-base-200 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Advers Logo"
            className="h-7 w-auto object-contain"
          />
          <span className="font-extrabold text-base tracking-tight text-base-content">
            Advers Media Operations
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-square btn-ghost btn-sm text-base-content"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-200/95 border-r border-base-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Advers Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-base-content block leading-tight">
                  ADVERS
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Media Operations Desk
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-base-content/60 hover:text-base-content"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="p-3 bg-base-100 rounded-2xl border border-base-300/50 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs shrink-0">
                AD
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-base-content truncate">
                  Chief Media Controller
                </div>
                <div className="text-[10px] text-base-content/60">
                  Broadcast & DOOH Staff
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-success ring-4 ring-success/20 shrink-0" />
          </div>

          {/* Nav List */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider px-3 mb-2">
              Operations Control
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    active
                      ? "bg-primary text-primary-content font-bold shadow-md"
                      : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`badge badge-xs font-bold ${
                        active
                          ? "bg-white text-primary"
                          : "badge-warning badge-soft"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-base-300/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-base-content/60">
            <span>Client View</span>
            <Link
              href="/portal/dashboard"
              className="text-primary font-bold hover:underline"
            >
              Open Portal →
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-base-content/40 font-mono">
              ADVERS BACKOFFICE
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Backoffice Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Admin Bottom Dock (< lg) */}
      <nav
        aria-label="Admin Navigation"
        className="dock dock-md lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-xl border-t border-base-200 shadow-2xl py-1 pb-[max(6px,env(safe-area-inset-bottom))]"
      >
        {mobileDockTabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center ${
                active ? "dock-active text-primary font-bold" : "text-base-content/60"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="dock-label text-[10px]">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
