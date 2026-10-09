"use client";

import React, { useEffect, useRef, useState } from "react";

interface SectionAnimatorProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export default function SectionAnimator({
  children,
  className = "",
  id,
  delay = 0,
}: SectionAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Reset when scrolling out of view so re-entering triggers reveal animation
          setIsVisible(false);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      style={{ transitionDelay: `${delay}ms` }}
      className={`section-animate ${isVisible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
