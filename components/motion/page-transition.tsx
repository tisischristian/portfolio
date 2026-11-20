"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASE_IN_OUT, gsap, prefersReduced } from "@/lib/motion";

const labelFor = (path: string) =>
  path.startsWith("/data")
    ? "Data"
    : path.startsWith("/design")
      ? "Design"
      : path.startsWith("/thoughts")
        ? "Thoughts"
        : path.startsWith("/manifesto")
          ? "Manifesto"
          : path.startsWith("/brief-me")
            ? "Brief Me"
            : "Index";

/**
 * Ink wipe between pages. Internal link clicks are intercepted (capture phase, so
 * next/link sees defaultPrevented and stands down), the panel covers the screen, we navigate, and the panel lifts once the new route has rendered.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const covering = useRef(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (prefersReduced() || covering.current) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/preview")) return;
      if (url.pathname === location.pathname) return; // same page / hash links: let the browser handle it

      e.preventDefault();
      covering.current = true;
      setLabel(labelFor(url.pathname));

      const el = panel.current!;
      gsap.killTweensOf(el);
      gsap.set(el, { display: "flex", yPercent: 100 });
      gsap.to(el, { yPercent: 0, duration: 0.6, ease: EASE_IN_OUT });
      // Navigate on a timer, not on tween completion, so a throttled/background tab
      // (where animation frames pause) still navigates.
      setTimeout(() => router.push(url.pathname + url.search + url.hash), 620);
      // Safety: never leave the screen covered, even if animation frames never run.
      setTimeout(() => {
        if (!covering.current) return;
        covering.current = false;
        gsap.killTweensOf(el);
        gsap.set(el, { display: "none" });
      }, 4000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  function reveal() {
    const el = panel.current;
    if (!el) return;
    covering.current = false;
    gsap.killTweensOf(el);
    gsap.to(el, {
      yPercent: -100,
      duration: 0.7,
      delay: 0.1,
      ease: EASE_IN_OUT,
      onComplete: () => void gsap.set(el, { display: "none" }),
    });
    // Same safety for the lift: hide outright if frames are paused.
    setTimeout(() => {
      if (!covering.current) gsap.set(el, { display: "none" });
    }, 1200);
  }

  useEffect(() => {
    if (covering.current) reveal();
  }, [pathname]);

  return (
    <div
      ref={panel}
      aria-hidden
      style={{ display: "none" }}
      className="fixed inset-0 z-[90] items-end border-t border-line-strong bg-bg text-fg"
    >
      <p className="display container-x pb-10 text-[length:var(--fs-h1)]">
        <span className="micro mb-4 block font-mono font-normal tracking-normal text-muted normal-case">{"// Loading"}</span>
        {label}
      </p>
    </div>
  );
}
