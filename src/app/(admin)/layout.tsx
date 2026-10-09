"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileSpreadsheet,
  Briefcase,
  Receipt,
  RefreshCw,
  Tv,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation: SidebarItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Inbox", href: "/admin/inbox", icon: Inbox, badge: "2 New" },
    { name: "Users & Clients", href: "/admin/users", icon: Users },
    { name: "Leads & Quotes", href: "/admin/leads", icon: FileSpreadsheet },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Invoices & Payments", href: "/admin/invoices", icon: Receipt },
    { name: "Renewals", href: "/admin/renewals", icon: RefreshCw },
    { name: "Billboard", href: "#", icon: Tv, badge: "Soon", disabled: true },
    { name: "Packages", href: "/admin/packages", icon: Package },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Team & Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile Top Header Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-base-200/60 border-b border-base-200 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="Advers Logo" className="h-7 w-auto" />
          <span className="font-extrabold text-lg tracking-tight">Advers Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-square btn-ghost btn-sm text-base-content"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-200/80 border-r border-base-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Advers Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xl font-extrabold tracking-tight text-base-content block leading-tight">
                  Advers
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Staff Backoffice
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
                <div className="text-xs font-bold text-base-content truncate">Advers Admin</div>
                <div className="text-[10px] text-base-content/60 truncate">admin@advers.ng</div>
              </div>
            </div>
            <span className="badge badge-primary badge-xs text-[9px] font-bold shrink-0">
              ADMIN
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;

              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-base-content/40 cursor-not-allowed opacity-60 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="badge badge-ghost text-[9px] font-bold py-0.5 px-1.5">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-sm"
                      : "text-base-content/75 hover:bg-base-300/60 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`badge text-[10px] font-extrabold py-0.5 px-1.5 border-none ${
                        isActive
                          ? "bg-white text-primary"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-base-200 space-y-2">
          <Link
            href="/portal/dashboard"
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-bold text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span>Go to Client View</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-base-content/40" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl text-xs font-bold text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-base-100">
        {/* Top Header Bar for Desktop */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-base-100 border-b border-base-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
              Staff Backoffice Portal
            </span>
            <span className="text-base-content/30">•</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/portal/dashboard"
              className="btn btn-outline border-base-300 text-xs font-bold rounded-xl h-9 min-h-0 px-3.5 gap-1.5"
            >
              <span>Client View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
