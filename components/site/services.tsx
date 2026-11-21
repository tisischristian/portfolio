import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site-settings";
import { ComingSoon } from "./coming-soon";
import { SectionLabel } from "@/components/ui/section-label";
import { Reveal } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";

/** Outlined numerals + hairline service lists (Graham reference). */
export async function Services({ index = "05" }: { index?: string }) {
  const [site, dataProjects] = await Promise.all([getSite(), getProjects("data")]);
  // Data analysis services read "Coming soon" until the first data project is published.
  const ready = (d: string) => d !== "data" || dataProjects.length > 0;
  return (
    <section className="container-x py-28 lg:py-40">
      <SectionLabel index={index}>Services</SectionLabel>
      <div className="mt-12 space-y-24 lg:space-y-32">
        {site.services.map((s) => (
          <div key={s.n} className="grid gap-8 lg:grid-cols-12">
            <Reveal
              as="p"
              mode="fade"
              aria-hidden
              className="text-outline font-mono text-[clamp(6rem,18vw,15rem)] leading-[0.8] font-light lg:col-span-5"
            >
              {s.n}
            </Reveal>
            <div className="lg:col-span-7">
              <Reveal as="h3" className="text-[length:var(--fs-h2)] leading-tight font-medium tracking-tight">
                {s.title}
              </Reveal>
              {!ready(s.discipline) ? (
                <ComingSoon className="mt-10" />
              ) : (
                <>
                  <p className="mt-4 max-w-md text-muted">{s.text}</p>
                  <ol className="mt-10 border-t border-line">
                    {s.items.map((it, i) => (
                      <li key={it} className="flex items-center justify-between border-b border-line py-4 text-sm sm:text-base">
                        {it}
                        <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={`/${s.discipline}`}
                    data-magnetic
                    className="micro mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 transition-colors hover:border-accent hover:bg-accent hover:text-ink"
                  >
                    See {s.discipline} exhibits <Arrow />
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
