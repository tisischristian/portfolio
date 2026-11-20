"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const Ctx = createContext<(node: React.ReactNode | null) => void>(() => {});

/** Cursor-following image preview for list rows (fine pointers only). */
export function HoverPreview({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<React.ReactNode | null>(null);
  const [shown, setShown] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const tick = () => {
      cx += (x - cx) * (reduce ? 1 : 0.18);
      cy += (y - cy) * (reduce ? 1 : 0.18);
      if (box.current) box.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const set = (n: React.ReactNode | null) => {
    if (n) setNode(n);
    setShown(!!n);
  };

  return (
    <Ctx.Provider value={set}>
      {children}
      <div
        ref={box}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 hidden aspect-[4/5] w-[min(22vw,320px)] [@media(pointer:fine)]:block"
      >
        <div
          className={`size-full overflow-hidden transition-[opacity,scale] duration-500 ease-[var(--ease)] ${
            shown ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          {node}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function PreviewTrigger({
  preview,
  children,
  className,
}: {
  preview: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const set = useContext(Ctx);
  return (
    <div className={className} onPointerEnter={() => set(preview)} onPointerLeave={() => set(null)}>
      {children}
    </div>
  );
}
