"use client";

import { useEffect, useRef } from "react";
import { EASE_OUT, SplitText, gsap, prefersReduced, whenLoaded } from "@/lib/motion";

type Props = {
  as?: React.ElementType;
  /** "lines" = masked line-by-line slide-up (headings, statements); "fade" = rise + fade (cards, media). */
  mode?: "lines" | "fade";
  delay?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">;

/**
 * Scroll-triggered reveal. The element is hidden by CSS only while JS is running and motion
 * is allowed (html.js:not(.reduce)), and a CSS fallback un-hides it after 2.5s regardless.
 */
export function Reveal({ as: Tag = "div", mode = "lines", delay = 0, className, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => gsap.set(el, { visibility: "visible" });
    if (prefersReduced()) return void show();

    // A gsap context records every tween/split so cleanup can fully revert inline styles.
    // (Without this, React's dev double-mount re-runs gsap.from() starting from the
    // already-hidden state and the element animates from invisible to invisible.)
    const ctx = gsap.context(() => {}, el);

    const stop = whenLoaded(() =>
      ctx.add(() => {
        if (mode === "lines") {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            // Keep the real text accessible: no aria-label on the element (invalid on <p>), lines stay readable.
            aria: "none",
            autoSplit: true,
            onSplit(self) {
              show();
              return gsap.from(self.lines, {
                yPercent: 115,
                duration: 1.1,
                ease: EASE_OUT,
                stagger: 0.08,
                delay,
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              });
            },
          });
        } else {
          show();
          gsap.fromTo(
            el,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: EASE_OUT,
              delay,
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            },
          );
        }
      }),
    );

    return () => {
      stop();
      ctx.revert();
    };
  }, [mode, delay]);

  return (
    <Tag ref={ref} data-reveal="" className={className} {...rest}>
      {children}
    </Tag>
  );
}
