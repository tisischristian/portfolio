"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Cover } from "@/components/site/cover";
import { FilterChips } from "@/components/site/filter-chips";
import { HoverPreview, PreviewTrigger } from "@/components/site/hover-preview";
import { Arrow } from "@/components/ui/arrow";

export type ThoughtRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  topic: "design" | "data" | "both";
  topicLabel: string;
  date: string;
  minutes: number;
  cover_url: string | null;
  featured: boolean;
};

/** Editorial index of Thoughts with Design / Data filters and a cursor-following cover preview. */
export function ThoughtList({ rows, compact = false }: { rows: ThoughtRow[]; compact?: boolean }) {
  const [topic, setTopic] = useState("All");
  const list = useMemo(
    () => (topic === "All" ? rows : rows.filter((r) => r.topic === "both" || r.topicLabel === topic)),
    [topic, rows],
  );

  return (
    <div>
      {!compact && (
        <div className="border-y border-line py-5">
          <FilterChips label="Filter by topic" options={["Design", "Data"]} value={topic} onChange={setTopic} />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {list.length} thoughts shown
      </p>
      {list.length === 0 ? (
        <p className="py-16 text-muted">Nothing on this topic yet.</p>
      ) : (
        <HoverPreview>
          <ol className={compact ? "border-t border-line" : ""}>
            {list.map((r) => (
              <li key={r.id}>
                <PreviewTrigger
                  preview={
                    r.cover_url ? <Cover src={r.cover_url} alt="" seed={r.slug} discipline="design" className="size-full" sizes="320px" reveal={false} /> : null
                  }
                >
                  <Reveal mode="fade">
                    <Link
                      href={`/thoughts/${r.slug}`}
                      data-cursor="Read"
                      className="group grid gap-3 border-b border-line py-8 transition-[padding] duration-500 ease-[var(--ease)] hover:px-3 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-10"
                    >
                      <span className="micro font-mono text-muted sm:col-span-2">
                        {r.featured && <span aria-label="Pinned">★ </span>}
                        {r.date}
                      </span>
                      <span className="sm:col-span-7">
                        <span className="display block text-[clamp(1.75rem,4vw,3.25rem)] leading-[0.95]">{r.title}</span>
                        {r.excerpt && !compact && <span className="mt-3 block max-w-2xl text-sm text-muted">{r.excerpt}</span>}
                      </span>
                      <span className="micro flex items-center justify-between gap-4 text-muted sm:col-span-3 sm:justify-end">
                        <span>
                          {r.topicLabel} · {r.minutes} min read
                        </span>
                        <span className="text-fg transition-[transform,color] duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent-text">
                          <Arrow />
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                </PreviewTrigger>
              </li>
            ))}
          </ol>
        </HoverPreview>
      )}
    </div>
  );
}
