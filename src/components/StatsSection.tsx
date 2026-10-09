"use client";

import React, { useEffect, useRef, useState } from "react";

interface CounterNumberProps {
  target: number;
  suffix?: string;
  prefix?: string;
  started: boolean;
  duration?: number;
}

function CounterNumber({
  target,
  suffix = "",
  prefix = "",
  started,
  duration = 1800,
}: CounterNumberProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) {
      setCount(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-out deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [started, target, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { target: 50, suffix: "+", label: "Billboard Locations" },
    { target: 120, suffix: "+", label: "Campaigns Launched" },
    { target: 85, suffix: "+", label: "Happy Advertisers" },
    { target: 25, suffix: "+", label: "Screen Partners" },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 border-y border-base-200 bg-base-200/50 backdrop-blur-sm transition-colors duration-300"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="stagger-child space-y-1 sm:space-y-1.5 group">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary group-hover:scale-105 transition-transform">
                <CounterNumber
                  target={item.target}
                  suffix={item.suffix}
                  started={isInView}
                />
              </div>
              <div className="text-xs sm:text-base font-semibold text-base-content/70">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
