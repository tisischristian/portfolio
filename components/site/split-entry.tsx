import Link from "next/link";
import type { Project } from "@/lib/types";
import { Cover } from "./cover";
import { HoverPreview, PreviewTrigger } from "./hover-preview";
import { ArrowCircle } from "@/components/ui/arrow";

/** Two full-width rows that route visitors into Design or Data. */
export function SplitEntry({ design, data }: { design?: Project; data?: Project }) {
  const rows = [
    { n: "01", href: "/design", label: "Design", sub: "Visual identity & graphic design", p: design, d: "design" as const },
    {
      n: "02",
      href: "/data",
      label: "Data",
      sub: data ? "Analysis, dashboards & insight" : "Coming soon",
      p: data,
      d: "data" as const,
    },
  ];
  return (
    <HoverPreview>
      <section aria-label="Choose a discipline" className="border-t border-line">
        {rows.map((r) => (
          <PreviewTrigger
            key={r.href}
            preview={
              r.d === "data" && !r.p ? null : (
                <Cover
                  src={r.p?.cover_url}
                  alt=""
                  seed={r.p?.slug ?? r.label}
                  discipline={r.d}
                  className="size-full"
                  sizes="320px"
                  reveal={false}
                />
              )
            }
          >
            <Link
              href={r.href}
              data-cursor="Open"
              className="group block border-b border-line transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-ink focus-visible:bg-accent focus-visible:text-ink"
            >
              <div className="container-x flex items-center gap-4 py-8 sm:gap-8 sm:py-14">
                <span className="font-mono text-sm text-muted transition-colors group-hover:text-current">{r.n}</span>
                <span className="display text-[length:var(--fs-h1)] transition-transform duration-500 ease-[var(--ease)] group-hover:translate-x-3">
                  {r.label}
                </span>
                <span className="micro ml-auto hidden max-w-56 text-right md:block">{r.sub}</span>
                <span
                  aria-hidden
                  className="ml-auto text-3xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 md:ml-0"
                >
                  <ArrowCircle />
                </span>
              </div>
            </Link>
          </PreviewTrigger>
        ))}
      </section>
    </HoverPreview>
  );
}
