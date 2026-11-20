"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLenis } from "@/lib/motion";
import { nav, type Discipline } from "@/lib/site";
import { useSite } from "./site-context";
import { DisciplineSwitch } from "./discipline-switch";
import { Arrow } from "@/components/ui/arrow";

export function Nav({ discipline }: { discipline: Discipline | null }) {
  const site = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating bar */}
      <header className="fixed inset-x-0 top-3 z-50 sm:top-4">
        <div className="container-x">
          <div
            className={`flex h-14 items-center justify-between gap-4 rounded-full border pl-5 pr-2 transition-[background-color,border-color,backdrop-filter] duration-500 ${
              scrolled || open
                ? "border-line-strong bg-bg/70 backdrop-blur-xl"
                : "border-transparent bg-transparent"
            }`}
          >
            <Link href="/" className="micro flex items-center gap-3 font-semibold">
              <span className="font-mono">{site.monogram}</span>
              <span aria-hidden className="hidden h-px w-8 bg-current md:block" />
              <span className="hidden text-muted md:block">{site.role}</span>
            </Link>

            <DisciplineSwitch active={discipline} className="hidden sm:flex" />

            <div className="flex items-center gap-2">
              <ul className="hidden items-center gap-6 lg:flex">
                {nav.slice(2).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className="micro underline-offset-4 hover:underline aria-[current=page]:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                data-magnetic
                className="micro hidden h-10 items-center rounded-full bg-fg px-4 text-bg transition-opacity hover:opacity-80 md:ml-4 md:inline-flex"
              >
                Get in touch <Arrow />
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative grid size-10 place-items-center rounded-full hover:bg-line lg:hidden"
              >
                <span
                  className={`absolute h-px w-5 bg-current transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`}
                />
                <span
                  className={`absolute h-px w-5 bg-current transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen mobile / tablet menu */}
      <div
        id="menu"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col bg-bg pt-28 pb-28 lg:hidden"
      >
        <nav aria-label="Main" className="container-x flex flex-1 flex-col justify-center">
          <ol className="divide-y divide-line border-y border-line">
            {nav.map((l, i) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-baseline justify-between py-4"
                  aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                >
                  <span className="display text-[clamp(2.5rem,12vw,5rem)]">{l.label}</span>
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="container-x micro flex items-end justify-between gap-6 text-muted">
          <p className="whitespace-pre-line">{site.location}</p>
        </div>
      </div>

      {/* Mobile: discipline switch pinned to the bottom */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center sm:hidden">
        <DisciplineSwitch active={discipline} className="bg-bg/80 backdrop-blur-xl" />
      </div>
    </>
  );
}
