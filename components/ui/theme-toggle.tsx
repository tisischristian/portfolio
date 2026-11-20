"use client";

import { useEffect, useState } from "react";

type Theme = "ink" | "paper";
const KEY = "pf-theme";

/**
 * Dark / light switch. The theme lives on <html data-theme> (set before paint by the boot
 * script in app/layout.tsx), so the whole site — and the admin — flip together.
 */
export function ThemeToggle({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [theme, setTheme] = useState<Theme>("ink");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "paper" ? "paper" : "ink");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "ink" ? "paper" : "ink";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "paper" ? "#ffffff" : "#060606");
    setTheme(next);
  };

  const label = theme === "ink" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`micro inline-flex h-10 items-center gap-2 rounded-full transition-colors hover:bg-line ${
        withLabel ? "px-3" : "w-10 justify-center"
      } ${className}`}
    >
      <svg viewBox="0 0 20 20" aria-hidden className="size-[18px] shrink-0">
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Filled half rotates to show the current mode */}
        <path
          d="M10 1.75a8.25 8.25 0 0 1 0 16.5Z"
          fill="currentColor"
          className="origin-center transition-transform duration-500"
          style={{ transform: theme === "ink" ? "rotate(0deg)" : "rotate(180deg)" }}
        />
      </svg>
      {withLabel && <span>{theme === "ink" ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
