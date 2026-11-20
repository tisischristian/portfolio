import { Blocks } from "@/components/blocks/blocks";
import { Cover } from "@/components/site/cover";
import { MetaRow, NextProject } from "@/components/site/next-project";
import { SectionLabel } from "@/components/ui/section-label";
import { isSample, type Project } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";

/** Shared by the public case-study page and the admin draft preview. */
export function DesignCaseStudyView({ p, next }: { p: Project; next: Project | null }) {

  return (
    <article>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <SectionLabel>
          Design — {p.category}
          {isSample(p) && " · Sample project"}
        </SectionLabel>
        <Reveal as="h1" className="display mt-6 mb-14 text-[length:var(--fs-h1)]">{p.title}</Reveal>
        <MetaRow
          items={[
            ["Client", p.client],
            ["Year", p.year],
            ["Role", p.role],
            ["Deliverables", p.deliverables?.join(", ")],
          ]}
        />
      </header>

      <Cover
        src={p.cover_url}
        alt={p.cover_alt ?? p.title}
        seed={p.slug}
        discipline="design"
        className="aspect-[4/3] sm:aspect-[16/9]"
        sizes="100vw"
        priority
        reveal={false}
      />

      {p.summary && (
        <section className="container-x grid gap-8 py-24 lg:grid-cols-12 lg:py-32">
          <SectionLabel index="01" className="lg:col-span-4">
            Overview
          </SectionLabel>
          <Reveal as="p" className="text-[length:var(--fs-h2)] leading-[1.15] font-medium tracking-tight lg:col-span-8">{p.summary}</Reveal>
        </section>
      )}

      {!!(p.palette?.length || p.fonts?.length) && (
        <section className="container-x mb-24 grid gap-12 border-t border-line pt-10 lg:mb-32 lg:grid-cols-12">
          <SectionLabel index="02" className="lg:col-span-4">
            Brand system
          </SectionLabel>
          <div className="space-y-14 lg:col-span-8">
            {!!p.palette?.length && (
              <div>
                <p className="micro mb-4 text-muted">Colour</p>
                <ul className="grid grid-cols-2 gap-[var(--gutter)] sm:grid-cols-4">
                  {p.palette.map((hex) => (
                    <li key={hex}>
                      <div className="aspect-square border border-line" style={{ background: hex }} />
                      <p className="micro mt-2 font-mono">{hex}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!p.fonts?.length && (
              <div>
                <p className="micro mb-4 text-muted">Typography</p>
                <ul className="border-t border-line">
                  {p.fonts.map((f, i) => (
                    <li key={f} className="flex items-baseline justify-between border-b border-line py-5">
                      <span className="text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium tracking-tight">{f}</span>
                      <span className="font-mono text-xs text-muted">{i === 0 ? "Primary" : "Secondary"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <Blocks blocks={p.blocks} slug={p.slug} discipline="design" />
      <NextProject p={next} />
    </article>
  );
}
