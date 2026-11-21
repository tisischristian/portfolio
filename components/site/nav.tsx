"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "@/components/ui/arrow";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getLenis } from "@/lib/motion";
import { CTA_LABEL, nav, type Discipline } from "@/lib/site";
import { DisciplineSwitch } from "./discipline-switch";
import { useSite } from "./site-context";

const isCurrent = (pathname: string, match: readonly string[]) => match.some((m) => pathname.startsWith(m));

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
            className={`flex h-14 items-center justify-between gap-3 rounded-full border pr-2 pl-5 transition-[background-color,border-color,backdrop-filter] duration-500 ${
              scrolled || open ? "border-line-strong bg-bg/70 backdrop-blur-xl" : "border-transparent bg-transparent"
            }`}
          >
            <Link href="/" className="micro flex items-center gap-3 font-semibold">
              <span className="font-mono">{site.monogram}</span>
              <span aria-hidden className="hidden h-px w-8 bg-current xl:block" />
              <span className="hidden text-muted xl:block">{site.role}</span>
            </Link>

            {/* Exhibits: Design | Data */}
            <DisciplineSwitch active={discipline} className="hidden sm:flex" />

            <div className="flex items-center gap-1">
              <ul className="mr-2 hidden items-center gap-5 lg:flex">
                {nav.slice(1).map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isCurrent(pathname, l.match) ? "page" : undefined}
                      className="micro underline-offset-4 hover:underline aria-[current=page]:text-accent-text aria-[current=page]:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ThemeToggle />
              <Link
                href="/brief-me"
                data-magnetic
                className="micro ml-1 hidden h-10 items-center gap-2 rounded-full bg-fg px-4 text-bg transition-colors hover:bg-accent hover:text-ink md:inline-flex"
              >
                {CTA_LABEL} <Arrow />
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative grid size-10 place-items-center rounded-full hover:bg-accent/15 hover:text-accent-text lg:hidden"
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
        data-lenis-prevent
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-bg pt-28 pb-28 lg:hidden [@media(max-height:560px)]:pt-24 [@media(max-height:560px)]:pb-20"
      >
        {/* Scrollable so the whole menu is reachable on short screens (e.g. a phone in landscape). */}
        <nav aria-label="Main" className="container-x flex flex-1 shrink-0 flex-col justify-center">
          <ol className="divide-y divide-line border-y border-line">
            {nav.map((l, i) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-baseline justify-between py-4 transition-colors hover:text-accent-text aria-[current=page]:text-accent-text [@media(max-height:560px)]:py-2"
                  aria-current={isCurrent(pathname, l.match) ? "page" : undefined}
                >
                  <span className="display text-[clamp(2.25rem,min(12vw,13svh),5rem)]">{l.label}</span>
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href="/brief-me"
            className="micro mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-fg px-5 text-bg md:hidden"
          >
            {CTA_LABEL} <Arrow />
          </Link>
        </nav>
        <div className="container-x micro flex items-end justify-between gap-6 text-muted">
          <p className="whitespace-pre-line">{site.location}</p>
        </div>
      </div>

      {/* Mobile: Exhibits switch pinned to the bottom */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center sm:hidden">
        <DisciplineSwitch active={discipline} className="bg-bg/80 backdrop-blur-xl" />
      </div>
    </>
  );
}
