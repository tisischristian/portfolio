import Link from "next/link";
import { isSample, type Project } from "@/lib/types";
import { Cover } from "./cover";
import { Arrow } from "@/components/ui/arrow";

function SampleTag({ p }: { p: Project }) {
  return isSample(p) ? <span className="font-mono text-muted">[Sample]</span> : null;
}

/** Image-led editorial card for design work. */
export function DesignCard({
  p,
  aspect = "aspect-[4/5]",
  sizes,
  priority,
}: {
  p: Project;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Link href={`/design/${p.slug}`} data-cursor="View" className="group block">
      <Cover
        src={p.cover_url}
        alt={p.cover_alt ?? p.title}
        seed={p.slug}
        discipline="design"
        className={aspect}
        sizes={sizes}
        priority={priority}
      />
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-medium tracking-tight sm:text-xl">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
            {p.title}
          </span>
        </h3>
        <span className="micro font-mono text-muted">[{p.year}]</span>
      </div>
      <p className="micro mt-1 flex gap-3 text-muted">
        <span>{p.category}</span>
        {p.client && <span>· {p.client}</span>}
        <SampleTag p={p} />
      </p>
    </Link>
  );
}

/** Metric-led card for data work. Sits inside a bordered grid. */
export function DataCard({ p, sizes }: { p: Project; sizes?: string }) {
  const metric = p.metrics[0];
  return (
    <Link
      href={`/data/${p.slug}`}
      data-cursor="View"
      className="group flex h-full flex-col border-r border-b border-line p-5 transition-colors duration-500 hover:bg-fg hover:text-bg sm:p-6"
    >
      <div className="micro flex justify-between font-mono">
        <span>[{p.category}]</span>
        <span className="text-muted group-hover:text-current">
          <SampleTag p={p} /> {p.year}
        </span>
      </div>
      <Cover
        src={p.cover_url}
        alt={p.cover_alt ?? p.title}
        seed={p.slug}
        discipline="data"
        className="mt-5 aspect-[16/10]"
        sizes={sizes}
      />
      <h3 className="mt-6 text-xl font-medium tracking-tight sm:text-2xl">{p.title}</h3>
      {p.question && <p className="mt-2 line-clamp-2 text-sm text-muted group-hover:text-current">{p.question}</p>}
      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        {metric ? (
          <div>
            <p data-count className="font-mono text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">{metric.value}</p>
            <p className="micro mt-2 text-muted group-hover:text-current">{metric.label}</p>
          </div>
        ) : (
          <span />
        )}
        <span aria-hidden className="text-2xl transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
          <Arrow />
        </span>
      </div>
      {p.tools && (
        <ul className="micro mt-6 flex flex-wrap gap-1.5 font-mono">
          {p.tools.map((t) => (
            <li key={t} className="rounded-full border border-line-strong px-2.5 py-1 group-hover:border-current">
              {t}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
