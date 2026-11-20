import Link from "next/link";
import type { Project } from "@/lib/types";
import { ArrowCircle } from "@/components/ui/arrow";

export function NextProject({ p }: { p: Project | null }) {
  if (!p) return null;
  return (
    <Link href={`/${p.discipline}/${p.slug}`} data-cursor="Next" className="group mt-28 block lg:mt-40">
      <div className="container-x py-16 sm:py-24">
        <p className="micro font-mono text-muted">{"// Next exhibit"}</p>
        <p className="display mt-6 flex items-start justify-between gap-6 text-[length:var(--fs-h1)] transition-transform duration-700 ease-[var(--ease)] group-hover:translate-x-3">
          {p.title}
          <span aria-hidden className="text-[0.6em] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowCircle />
          </span>
        </p>
      </div>
    </Link>
  );
}

export function MetaRow({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="micro grid grid-cols-2 gap-6 border-t border-line pt-6 lg:grid-cols-4">
      {items
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k}>
            <dt className="mb-2 font-mono text-muted">[{k}]</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  );
}
