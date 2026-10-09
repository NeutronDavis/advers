"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="relative z-10 bg-base-100 border-t border-base-200 w-full py-12 sm:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="sm:col-span-2 lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Advers Logo"
              className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-sm"
            />
            <span className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              Advers
            </span>
          </Link>

          <p className="text-base-content/80 text-sm leading-relaxed max-w-xs font-normal">
            The modern operating system for outdoor advertising and digital brand
            visibility across West Africa.
          </p>

          <div className="text-xs text-base-content/50 pt-1">
            © 2026 Advers Inc. All rights reserved.
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-bold text-base-content text-base">Platform</h5>
          <ul className="space-y-2.5 text-sm text-base-content/75">
            <li>
              <a href="/#about" className="hover:text-primary transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="hover:text-primary transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="/#placements" className="hover:text-primary transition-colors">
                Placements
              </a>
            </li>
            <li>
              <Link href="/visibility-journey" className="text-primary font-semibold hover:underline">
                Digital Packages
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="font-bold text-base-content text-base">Company</h5>
          <ul className="space-y-2.5 text-sm text-base-content/75">
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <a href="/about" className="hover:text-primary transition-colors">
                Careers
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors font-semibold">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="font-bold text-base-content text-base">Legal</h5>
          <ul className="space-y-2.5 text-sm text-base-content/75">
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
