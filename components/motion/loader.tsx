"use client";

import { useEffect, useRef } from "react";
import { EASE_IN_OUT, gsap } from "@/lib/motion";

/**
 * First-visit-per-session loader: monogram + 0→100 counter (≤1.2s), then lifts.
 * Whether it shows is decided before paint by the inline script in the root layout,
 * which sets html.pf-loading; otherwise this renders nothing visible.
 */
export function Loader({ monogram }: { monogram: string }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("pf-loading")) return;
    try {
      sessionStorage.setItem("pf-seen", "1");
    } catch {}

    const o = { v: 0 };
    const finish = () => {
      html.classList.remove("pf-loading");
      window.dispatchEvent(new Event("pf:loaded"));
    };
    const tl = gsap.timeline();
    tl.to(o, {
      v: 100,
      duration: 0.9,
      ease: "power2.inOut",
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(o.v)).padStart(3, "0");
      },
    })
      .to(root.current, { yPercent: -100, duration: 0.7, ease: EASE_IN_OUT }, "+=0.05")
      .add(finish, "-=0.45");
    // Safety: if animation frames are paused (background tab), never keep the page locked.
    const safety = setTimeout(() => {
      if (html.classList.contains("pf-loading")) {
        tl.kill();
        finish();
      }
    }, 2500);
    return () => {
      clearTimeout(safety);
      tl.kill();
      finish();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pf-loader fixed inset-0 z-[100] hidden flex-col justify-between bg-bg p-[var(--margin)] text-fg">
      <p className="micro font-mono">{monogram}</p>
      <div className="flex items-end justify-between">
        <p className="micro font-mono text-muted">Design · Data</p>
        <span ref={num} className="font-mono text-[clamp(4rem,14vw,11rem)] leading-none tracking-tight">
          000
        </span>
      </div>
    </div>
  );
}
