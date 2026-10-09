"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, MessageSquare, Settings, Sparkles, User, Bell, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/portal/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/portal/projects", icon: FolderKanban },
    { label: "Messages", href: "/portal/messages", icon: MessageSquare },
    { label: "Settings", href: "/portal/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col md:flex-row transition-colors duration-300">
      {/* Desktop Sidebar (>= md) */}
      <aside className="hidden md:flex flex-col w-64 bg-base-100 border-r border-base-200 p-5 shrink-0 sticky top-0 h-screen justify-between z-30">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Advers Logo" className="h-8 w-auto" />
            <span className="text-xl font-extrabold text-base-content tracking-tight">
              Advers Portal
            </span>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    active
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content/80 hover:bg-base-200 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-base-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary/10 text-primary w-9 rounded-full flex items-center justify-center font-bold text-xs">
                  OA
                </div>
              </div>
              <div>
                <div className="font-bold text-xs text-base-content">Olumide A.</div>
                <div className="text-[10px] text-base-content/60">Client Owner</div>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold text-error hover:bg-error/10 p-2 rounded-xl transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Mobile Header Bar (< md) */}
        <header className="flex md:hidden justify-between items-center px-4 h-16 bg-base-100/90 backdrop-blur-xl border-b border-base-200 sticky top-0 z-30">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Advers Logo" className="h-7 w-auto" />
            <span className="text-lg font-extrabold tracking-tight">Advers</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 rounded-xl bg-base-200 relative">
              <Bell className="w-4 h-4 text-base-content" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation Bar (< md) - Native App Vibe */}
      <div className="dock dock-lg md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-100/95 backdrop-blur-2xl border-t border-base-200 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dock-item ${active ? "dock-active text-primary" : "text-base-content/60"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="dock-label text-[11px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
