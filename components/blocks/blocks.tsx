import type { Discipline } from "@/lib/site";
import type { Block } from "@/lib/types";
import { Cover } from "@/components/site/cover";
import { LazyChart } from "@/components/charts/lazy-chart";
import { Reveal } from "@/components/motion/reveal";

const isSafeUrl = (u: string) => /^https:\/\//.test(u);

function Figure({
  img,
  seed,
  discipline,
  aspect,
  sizes,
}: {
  img: { url?: string | null; alt: string; caption?: string };
  seed: string;
  discipline: Discipline;
  aspect: string;
  sizes: string;
}) {
  return (
    <figure>
      <Cover src={img.url} alt={img.alt} seed={seed} discipline={discipline} className={aspect} sizes={sizes} reveal={false} />
      {img.caption && <figcaption className="micro mt-3 text-muted">{img.caption}</figcaption>}
    </figure>
  );
}

/** Renders a project's ordered content blocks. */
export function Blocks({ blocks, slug, discipline }: { blocks: Block[]; slug: string; discipline: Discipline }) {
  return (
    <div className="space-y-16 lg:space-y-24">
      {blocks.map((b, i) => {
        const el = renderBlock(b, i);
        return el ? (
          <Reveal key={i} mode="fade">
            {el}
          </Reveal>
        ) : null;
      })}
    </div>
  );

  function renderBlock(b: Block, i: number) {
        const seed = `${slug}-${i}`;
        switch (b.type) {
          case "heading":
            return (
              <h2 key={i} className="container-x text-[length:var(--fs-h2)] leading-tight font-medium tracking-tight">
                {b.text}
              </h2>
            );
          case "text":
            return (
              <div key={i} className="container-x">
                <div className="max-w-2xl space-y-5 text-muted lg:ml-[calc(100%/12*4)]">
                  {b.text.split(/\n\s*\n/).map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            );
          case "image":
            return (
              <div key={i} className="container-x">
                <Figure img={b} seed={seed} discipline={discipline} aspect="aspect-[3/2]" sizes="(min-width:1024px) 80vw, 100vw" />
              </div>
            );
          case "full-image":
            return <Figure key={i} img={b} seed={seed} discipline={discipline} aspect="aspect-[16/9]" sizes="100vw" />;
          case "image-grid":
            return (
              <div
                key={i}
                className={`container-x grid gap-[var(--gutter)] ${b.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                {b.images.map((img, j) => (
                  <Figure
                    key={j}
                    img={img}
                    seed={`${seed}-${j}`}
                    discipline={discipline}
                    aspect={b.columns === 3 ? "aspect-[3/4]" : "aspect-[4/5]"}
                    sizes={b.columns === 3 ? "(min-width:640px) 33vw, 100vw" : "(min-width:640px) 50vw, 100vw"}
                  />
                ))}
              </div>
            );
          case "video":
            return isSafeUrl(b.url) ? (
              <figure key={i} className="container-x">
                <video src={b.url} controls playsInline className="w-full" />
                {b.caption && <figcaption className="micro mt-3 text-muted">{b.caption}</figcaption>}
              </figure>
            ) : null;
          case "quote":
            return (
              <blockquote key={i} className="container-x">
                <p className="max-w-4xl text-[length:var(--fs-h2)] leading-[1.2] italic">&ldquo;{b.text}&rdquo;</p>
                {b.cite && <footer className="micro mt-6 text-muted">— {b.cite}</footer>}
              </blockquote>
            );
          case "code":
            return (
              <div key={i} className="container-x">
                <div className="border border-line lg:ml-[calc(100%/12*4)]">
                  <p className="micro border-b border-line px-5 py-3 font-mono text-muted">{b.language ?? "code"}</p>
                  <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
                    <code>{b.code}</code>
                  </pre>
                </div>
              </div>
            );
          case "chart":
            return (
              <div key={i} className="container-x">
                <LazyChart block={b} />
              </div>
            );
          case "embed":
            return isSafeUrl(b.url) ? (
              <div key={i} className="container-x">
                <div className="relative w-full border border-line" style={{ aspectRatio: b.ratio ?? "16 / 9" }}>
                  <iframe
                    src={b.url}
                    title={b.title}
                    loading="lazy"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                </div>
              </div>
            ) : null;
          case "metrics":
            return (
              <div key={i} className="container-x">
                <MetricsRow items={b.items} />
              </div>
            );
          case "divider":
            return <hr key={i} className="container-x border-line" />;
          default:
            return null;
        }
  }
}

export function MetricsRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => (
        <div key={m.label} className="border-r border-b border-line p-6">
          <dd data-count className="font-mono text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight">{m.value}</dd>
          <dt className="micro mt-4 text-muted">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}
