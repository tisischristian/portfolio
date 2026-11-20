"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger, gsap, prefersReduced, scrollState, setLenis } from "@/lib/motion";

/** Parses "−23%", "$310K", "0.87", "6 h/wk" → prefix, number, suffix, decimals. */
function parseCount(text: string) {
  const m = text.match(/^([^\d]*)(\d+(?:[.,]\d+)?)([\s\S]*)$/);
  if (!m) return null;
  const num = m[2].replace(",", ".");
  return { prefix: m[1], value: parseFloat(num), suffix: m[3], decimals: (num.split(".")[1] ?? "").length };
}

/**
 * Site-wide motion: Lenis smooth scroll (synced with ScrollTrigger), magnetic
 * [data-magnetic] elements and count-up [data-count] numbers. Everything is skipped
 * under prefers-reduced-motion; the static HTML is always the final state.
 */
export function MotionProvider() {
  const pathname = usePathname();

  // Smooth scroll
  useEffect(() => {
    if (prefersReduced()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    setLenis(lenis);
    lenis.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      if (l.direction) scrollState.direction = l.direction > 0 ? 1 : -1;
      ScrollTrigger.update();
    });
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New page: jump to top, re-measure triggers once layout settles.
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(id);
  }, [pathname]);

  // Magnetic elements (fine pointers only)
  useEffect(() => {
    if (prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    let active: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (active && active !== el) {
        gsap.to(active, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        active = null;
      }
      if (!el) return;
      active = el;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      gsap.to(el, { x: dx * 8, y: dy * 8, duration: 0.4, ease: "power3.out" });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // Count-up numbers, re-scanned on every page
  useEffect(() => {
    if (prefersReduced()) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-count]:not([data-counted])"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.dataset.counted = "";
          const final = el.textContent ?? "";
          const p = parseCount(final);
          if (!p) continue;
          const o = { v: 0 };
          gsap.to(o, {
            v: p.value,
            duration: 1.6,
            ease: "power3.out",
            onUpdate: () => (el.textContent = `${p.prefix}${o.v.toFixed(p.decimals)}${p.suffix}`),
            onComplete: () => (el.textContent = final),
          });
        }
      },
      { threshold: 0.6 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
