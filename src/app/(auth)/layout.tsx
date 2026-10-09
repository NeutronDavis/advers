import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <header className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Advers Logo"
            className="h-7 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-base-content">
            Advers
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content Card (Mobile App Vibe) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-base-100/90 backdrop-blur-xl border border-base-200 rounded-3xl p-6 sm:p-8 shadow-3d relative">
          {children}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-base-content/50 z-20">
        © 2026 Advers Inc. All rights reserved.
      </footer>
    </div>
  );
}
