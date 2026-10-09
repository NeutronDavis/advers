"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme =
      (localStorage.getItem("advers-theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("advers-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center opacity-60">
        <Moon className="w-5 h-5 text-base-content" />
      </div>
    );
  }

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-circle text-base-content hover:bg-base-200 transition-colors"
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

      {/* Sun icon (shown when theme is dark) */}
      <Sun className="swap-on w-5 h-5 text-amber-400" />

      {/* Moon icon (shown when theme is light) */}
      <Moon className="swap-off w-5 h-5 text-primary" />
    </label>
  );
}
