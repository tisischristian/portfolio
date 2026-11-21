"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isSample, type Project } from "@/lib/types";
import { Cover } from "./cover";
import { FilterChips } from "./filter-chips";
import { HoverPreview, PreviewTrigger } from "./hover-preview";
import { DesignCard } from "./project-cards";
import { Reveal } from "@/components/motion/reveal";

const VIEW_KEY = "pf-design-view";
const aspects = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]"];

export function DesignIndex({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    try {
      const v = localStorage.getItem(VIEW_KEY);
      if (v === "grid" || v === "list") setView(v);
    } catch {}
  }, []);

  const changeView = (v: "grid" | "list") => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const list = useMemo(
    () => (cat === "All" ? projects : projects.filter((p) => p.category === cat)),
    [cat, projects],
  );

  return (
    <section className="container-x pb-28">
      <div className="flex flex-col gap-6 border-y border-line py-5 md:flex-row md:items-center md:justify-between">
        <FilterChips label="Filter by category" options={categories} value={cat} onChange={setCat} />
        <div role="group" aria-label="View" className="micro flex shrink-0 gap-4 font-mono">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => changeView(v)}
              className={`underline-offset-4 ${view === v ? "text-accent-text underline" : "text-muted hover:text-accent-text"}`}
            >
              [{v}]
            </button>
          ))}
        </div>
      </div>

      <h2 className="sr-only">Projects</h2>
      <p className="sr-only" aria-live="polite">
        {list.length} projects shown
      </p>

      {list.length === 0 ? (
        <p className="py-24 text-muted">Nothing in this category yet.</p>
      ) : view === "grid" ? (
        <div className="mt-12 columns-1 gap-[var(--gutter)] sm:columns-2 lg:columns-3">
          {list.map((p, i) => (
            <Reveal key={p.id} mode="fade" className="mb-14 break-inside-avoid">
              <DesignCard
                p={p}
                aspect={aspects[i % aspects.length]}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                priority={i < 2}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <HoverPreview>
          <ol className="mt-6">
            {list.map((p, i) => (
              <li key={p.id}>
                <PreviewTrigger
                  preview={<Cover src={p.cover_url} alt="" seed={p.slug} discipline="design" className="size-full" sizes="320px" reveal={false} />}
                >
                  <Link
                    href={`/design/${p.slug}`}
                    data-cursor="View"
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-line py-6 transition-[padding] duration-500 ease-[var(--ease)] hover:px-3 sm:grid-cols-12 sm:py-8"
                  >
                    <span className="font-mono text-xs text-muted sm:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[clamp(1.5rem,4vw,3rem)] leading-none font-medium tracking-tight sm:col-span-6">
                      {p.title}
                    </span>
                    <span className="micro hidden text-muted sm:col-span-3 sm:block">
                      {p.category} {isSample(p) && "· Sample"}
                    </span>
                    <span className="micro hidden text-muted sm:col-span-1 sm:block">{p.client}</span>
                    <span className="micro text-right font-mono sm:col-span-1">{p.year}</span>
                  </Link>
                </PreviewTrigger>
              </li>
            ))}
          </ol>
        </HoverPreview>
      )}
    </section>
  );
}
