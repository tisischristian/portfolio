"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSite } from "./site-context";
import { Arrow, ArrowCircle } from "@/components/ui/arrow";

function LocalTime() {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () =>
      setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    fmt();
    const id = setInterval(fmt, 30_000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono">{t ?? "--:--"}</span>;
}

export function Footer() {
  const site = useSite();
  return (
    <footer className="pt-24 pb-28 sm:pb-10">
      <div className="container-x">
        <p className="micro mb-6 font-mono text-muted">{"// Brief me"}</p>
        <Link
          href="/brief-me"
          data-cursor="Say hi"
          className="display group inline-flex items-start gap-[0.1em] text-[clamp(3.5rem,13vw,12rem)]"
        >
          Let&rsquo;s talk
          <span
            aria-hidden
            className="text-[0.5em] transition-[transform,color] duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-accent-text"
          >
            <ArrowCircle />
          </span>
        </Link>

        <div className="micro mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-6 lg:grid-cols-4">
          {/* Email gets its own full-width row below lg: monospaced addresses are too wide for half a phone screen. */}
          <div className="col-span-2 min-w-0 lg:col-span-1">
            <p className="mb-2 text-muted">Email</p>
            <a href={`mailto:${site.email}`} className="normal-case [overflow-wrap:anywhere] hover:underline">
              {site.email}
            </a>
          </div>
          <div>
            <p className="mb-2 text-muted">Social</p>
            <ul className="space-y-1">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-1 hover:underline">
                    {s.label} <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-muted">Local time</p>
            <LocalTime />
          </div>
          <div className="lg:text-right">
            <p className="mb-2 text-muted">Status</p>
            <p className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className={`size-2 rounded-full ${site.available ? "bg-accent" : "border border-current"}`}
              />
              {site.available ? "Available for work" : "Booked"}
            </p>
          </div>
        </div>

        <p className="micro mt-12 flex justify-between text-muted">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span className="font-mono">[{site.monogram}]</span>
        </p>
      </div>
    </footer>
  );
}
