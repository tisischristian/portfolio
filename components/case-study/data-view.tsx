import { Blocks, MetricsRow } from "@/components/blocks/blocks";
import { Cover } from "@/components/site/cover";
import { MetaRow, NextProject } from "@/components/site/next-project";
import { SectionLabel } from "@/components/ui/section-label";
import { isSample, type Project } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";

function Step({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <section className="container-x grid gap-8 border-t border-line pt-10 lg:grid-cols-12">
      <SectionLabel index={n} className="lg:col-span-4">
        {label}
      </SectionLabel>
      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}

/** Shared by the public case-study page and the admin draft preview. */
export function DataCaseStudyView({ p, next }: { p: Project; next: Project | null }) {

  const links = [
    ["GitHub", p.github_url],
    ["Notebook", p.notebook_url],
    ["Report (PDF)", p.report_url],
    ["Live dashboard", p.embed_url],
  ].filter(([, u]) => u) as [string, string][];

  let n = 0;
  const idx = () => String(++n).padStart(2, "0");

  return (
    <article>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <SectionLabel>
          Data — {p.category}
          {isSample(p) && " · Sample project"}
        </SectionLabel>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-h1)]">{p.title}</Reveal>
        {p.summary && <p className="mt-8 mb-14 max-w-2xl text-lg text-muted">{p.summary}</p>}
        <MetaRow
          items={[
            ["Dataset", p.dataset_source],
            ["Size", p.dataset_size],
            ["Tools", p.tools?.join(" · ")],
            ["Year", p.year],
          ]}
        />
      </header>

      {p.cover_url && (
        <Cover src={p.cover_url} alt={p.cover_alt ?? p.title} seed={p.slug} discipline="data" className="aspect-[16/9]" sizes="100vw" priority reveal={false} />
      )}

      <div className="space-y-24 py-16 lg:space-y-32 lg:py-24">
        {p.question && (
          <Step n={idx()} label="Question">
            <Reveal as="p" className="text-[length:var(--fs-h2)] leading-[1.15] font-medium tracking-tight">{p.question}</Reveal>
          </Step>
        )}

        {(p.dataset_source || p.dataset_size) && (
          <Step n={idx()} label="Data">
            <dl className="grid gap-6 font-mono text-sm sm:grid-cols-2">
              {p.dataset_source && (
                <div>
                  <dt className="micro text-muted">Source</dt>
                  <dd className="mt-2">{p.dataset_source}</dd>
                </div>
              )}
              {p.dataset_size && (
                <div>
                  <dt className="micro text-muted">Size</dt>
                  <dd className="mt-2">[{p.dataset_size}]</dd>
                </div>
              )}
            </dl>
          </Step>
        )}

        {p.blocks.length > 0 && (
          <div>
            <Step n={idx()} label="Method & insights">
              <span className="sr-only">Method and insights</span>
            </Step>
            <div className="mt-12">
              <Blocks blocks={p.blocks} slug={p.slug} discipline="data" />
            </div>
          </div>
        )}

        {p.metrics.length > 0 && (
          <Step n={idx()} label="Impact">
            <MetricsRow items={p.metrics} />
          </Step>
        )}

        {links.length > 0 && (
          <Step n={idx()} label="Artifacts">
            {p.embed_url?.startsWith("https://") && (
              <div className="relative mb-10 aspect-video w-full border border-line">
                <iframe src={p.embed_url} title={`${p.title} dashboard`} loading="lazy" allowFullScreen className="absolute inset-0 size-full" />
              </div>
            )}
            <ul className="border-t border-line">
              {links.map(([label, url]) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-line py-5 text-lg transition-[padding] duration-500 hover:px-3"
                  >
                    {label}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Step>
        )}
      </div>

      <NextProject p={next} />
    </article>
  );
}
