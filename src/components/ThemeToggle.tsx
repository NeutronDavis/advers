"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Sun, Moon } from "lucide-react";
import { updateThemePreferenceAction } from "@/server/actions/account";

type Preference = "LIGHT" | "DARK" | "SYSTEM";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("advers-theme", theme);
}

export default function ThemeToggle({
  preference,
  persist = false,
}: {
  preference?: Preference;
  persist?: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("advers-theme") as "light" | "dark" | null;

    let resolved: "light" | "dark";
    if (preference === "SYSTEM") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else if (preference === "LIGHT" || preference === "DARK") {
      resolved = preference.toLowerCase() as "light" | "dark";
    } else {
      resolved = saved ?? "light";
    }

    setTheme(resolved);
    applyTheme(resolved);
  }, [preference]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);

    if (persist) {
      startTransition(async () => {
        await updateThemePreferenceAction(newTheme === "dark" ? "DARK" : "LIGHT");
      });
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-60">
        <Moon className="w-5 h-5 text-[var(--portal-gold)]" />
      </div>
    );
  }

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-circle text-[var(--portal-gold)] hover:bg-[var(--portal-gold-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-gold)] transition-colors"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      aria-label="Toggle theme"
    >
      <input
        type="checkbox"
        className="theme-controller"
        value="dark"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <Sun className="swap-on w-5 h-5 text-[var(--portal-gold)]" />
      <Moon className="swap-off w-5 h-5 text-[var(--portal-gold)]" />
    </label>
  );
}
