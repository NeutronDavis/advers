"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X ,Package} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 w-full z-[100] bg-base-100/85 backdrop-blur-xl border-b border-base-200 transition-colors">
      <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-20">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="Advers Logo"
            className="h-7 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-sm"
          />
          <span className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
            Advers
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link
            href="/about"
            className={`font-medium transition-colors text-base ${
              pathname === "/about"
                ? "text-primary font-bold"
                : "text-base-content/80 hover:text-primary"
            }`}
          >
            About
          </Link>
       
          <Link
            href="/visibility-journey"
            className={`inline-flex items-center gap-1.5 text-sm lg:text-base font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
              pathname === "/visibility-journey"
                ? "bg-primary text-primary-content"
                : "text-primary bg-base-200 hover:text-secondary"
            }`}
          >
            <Package className="w-4 h-4" />
            Digital Packages
          </Link>
          <Link
            href="/contact"
            className={`font-medium transition-colors text-base ${
              pathname === "/contact"
                ? "text-primary font-bold"
                : "text-base-content/80 hover:text-primary"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-base-content/80 font-semibold hover:text-primary transition-colors text-sm lg:text-base px-3 py-2"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-[#4f46e5] text-white px-5 lg:px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-[#3525cd] transition-all text-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 text-base-content rounded-xl hover:bg-base-200 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-base-100/98 backdrop-blur-2xl border-b border-base-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-semibold py-2 px-3 rounded-xl transition-colors ${
                pathname === "/" ? "bg-primary/10 text-primary" : "text-base-content hover:bg-base-200"
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-semibold py-2 px-3 rounded-xl transition-colors ${
                pathname === "/about" ? "bg-primary/10 text-primary" : "text-base-content/80 hover:bg-base-200"
              }`}
            >
              About
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-base-content/80 py-2 px-3 rounded-xl hover:bg-base-200 transition-colors"
            >
              How it works
            </a>
            <Link
              href="/visibility-journey"
              onClick={() => setMobileOpen(false)}
              className={`inline-flex items-center gap-2.5 text-base font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                pathname === "/visibility-journey"
                  ? "bg-primary text-primary-content shadow-md"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              Digital Presence Packages
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className={`text-base font-semibold py-2 px-3 rounded-xl transition-colors ${
                pathname === "/contact" ? "bg-primary/10 text-primary" : "text-base-content/80 hover:bg-base-200"
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="pt-3 border-t border-base-200 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-base-content/80 hover:bg-base-200 rounded-xl transition-colors block"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white w-full rounded-xl text-center border-none shadow-md font-bold py-3 text-base block"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
