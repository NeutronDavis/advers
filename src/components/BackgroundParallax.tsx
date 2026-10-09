"use client";

import React, { useEffect, useState } from "react";

export default function BackgroundParallax() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Shape 1: Top Left Hexagon */}
      <div
        className="floating-shape top-[8%] left-[4%]"
        style={{
          transform: `translateY(${scrollY * 0.18}px) rotate(${scrollY * 0.03}deg)`,
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path
            d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="4 2"
            opacity="0.25"
          />
        </svg>
      </div>

      {/* Floating Shape 2: Mid Right Rotated Square */}
      <div
        className="floating-shape top-[38%] right-[6%]"
        style={{
          transform: `translateY(${scrollY * 0.32}px) rotate(${15 + scrollY * 0.05}deg)`,
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-secondary"
        >
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="16"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Floating Shape 3: Mid-Bottom Left Circle Rings */}
      <div
        className="floating-shape top-[62%] left-[12%]"
        style={{
          transform: `translateY(${scrollY * 0.22}px) scale(${1 + Math.sin(scrollY * 0.002) * 0.1})`,
        }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-primary" strokeWidth="0.6" opacity="0.15" />
          <circle cx="50" cy="50" r="28" stroke="currentColor" className="text-accent" strokeWidth="0.4" opacity="0.2" />
        </svg>
      </div>

      {/* Floating Shape 4: Far Bottom Right Glowing Prism */}
      <div
        className="floating-shape top-[82%] right-[14%]"
        style={{
          transform: `translateY(${scrollY * 0.15}px) rotate(${-scrollY * 0.04}deg)`,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-accent"
        >
          <polygon
            points="50,10 90,85 10,85"
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Ambient Gradient Soft Orbs */}
      <div
        className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.08}px)`,
        }}
      />
      <div
        className="absolute top-2/3 -right-20 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"
        style={{
          transform: `translateY(${-scrollY * 0.06}px)`,
        }}
      />
    </div>
  );
}
