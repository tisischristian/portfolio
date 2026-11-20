"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/** Matches --ease: cubic-bezier(0.7, 0, 0.2, 1) closely enough for wipes. */
export const EASE_IN_OUT = "power4.inOut";
export const EASE_OUT = "expo.out";

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

/** Last scroll direction: 1 = down, -1 = up. Read by the marquee. */
export const scrollState = { direction: 1 as 1 | -1, velocity: 0 };

/** Runs `cb` once the first-visit loader has finished (immediately if there is none). */
export function whenLoaded(cb: () => void) {
  if (!document.documentElement.classList.contains("pf-loading")) {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener("pf:loaded", h, { once: true });
  return () => window.removeEventListener("pf:loaded", h);
}
