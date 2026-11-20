"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "@/lib/motion";

/**
 * Dot cursor that grows into a labelled ring over interactive elements.
 * Label comes from the nearest [data-cursor] ("View", "Open"…); plain links/buttons just grow.
 * Fine pointers only; never on touch or with reduced motion. Uses mix-blend-difference so it
 * reads on both ink and paper.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      const interactive = t?.closest("a, button, [role=button], label, summary, select");
      setLabel(labelled?.dataset.cursor || null);
      setHover(!!(labelled || interactive));
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    const leave = () => (x = y = -100);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  // Reset state after navigation (the hovered element is gone).
  useEffect(() => {
    setLabel(null);
    setHover(false);
  }, [pathname]);

  if (!enabled) return null;
  const size = label ? 84 : hover ? 44 : 10;

  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[110] mix-blend-difference">
      <div
        className="micro grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white font-mono text-[0.65rem] text-black transition-[width,height,background-color,scale] duration-300 ease-[var(--ease)]"
        style={{
          width: size,
          height: size,
          scale: down ? 0.85 : 1,
          backgroundColor: hover && !label ? "transparent" : "#fff",
          border: hover && !label ? "1px solid #fff" : "none",
        }}
      >
        {label && <span className="mix-blend-normal">{label}</span>}
      </div>
    </div>
  );
}
