"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { FilterChips } from "./filter-chips";
import { DataCard } from "./project-cards";
import { Reveal } from "@/components/motion/reveal";

export function DataIndex({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const list = useMemo(
    () => (cat === "All" ? projects : projects.filter((p) => p.category === cat)),
    [cat, projects],
  );

  return (
    <section className="container-x pb-28">
      <div className="border-y border-line py-5">
        <FilterChips label="Filter by type" options={categories} value={cat} onChange={setCat} />
      </div>
      <p className="sr-only" aria-live="polite">
        {list.length} projects shown
      </p>
      {list.length === 0 ? (
        <p className="py-24 text-muted">Nothing in this category yet.</p>
      ) : (
        <div className="mt-12 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} mode="fade" delay={(i % 3) * 0.08}>
              <DataCard p={p} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
