"use client";

import { useEffect, useRef } from "react";
import { prefersReduced, scrollState } from "@/lib/motion";

/**
 * Infinite ticker (Howat reference). Drifts left, flips direction with the scroll direction,
 * speeds up with scroll velocity and pauses on hover. Static under reduced motion.
 */
export function Marquee({ items, className = "" }: { items: readonly string[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReduced()) return;
    let x = 0, raf = 0, last = performance.now(), paused = false, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const enter = () => (paused = true);
    const leave = () => (paused = false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!paused && visible) {
        const half = el.scrollWidth / 2;
        const speed = 0.045 + Math.min(Math.abs(scrollState.velocity) * 0.02, 0.6);
        x -= scrollState.direction * speed * dt;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-8 whitespace-nowrap">
          {t}
          <span aria-hidden className="size-1.5 bg-current" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
