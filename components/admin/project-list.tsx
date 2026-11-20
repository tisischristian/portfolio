"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteProject, reorderProjects, setProjectFlags } from "@/app/admin/actions";
import { DragHandle, SortableList } from "./sortable";
import { Badge } from "./ui";
import { Arrow } from "@/components/ui/arrow";

type Row = {
  id: string;
  title: string;
  slug: string;
  discipline: "design" | "data";
  status: "draft" | "published";
  featured: boolean;
  category: string | null;
  year: number | null;
  cover_url: string | null;
  sort_order: number;
};

const tabCls = (on: boolean) =>
  `micro h-9 rounded-full px-4 transition-colors ${on ? "bg-fg text-bg" : "border border-line-strong hover:border-fg"}`;

export function ProjectList({ projects }: { projects: Row[] }) {
  const [rows, setRows] = useState(projects);
  const [discipline, setDiscipline] = useState<"design" | "data">("design");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const list = useMemo(
    () => rows.filter((r) => r.discipline === discipline && (status === "all" || r.status === status)),
    [rows, discipline, status],
  );

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? ok : `✕ ${r.error}`);
    });

  const patch = (id: string, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const onReorder = (next: Row[]) => {
    // Rows hidden by the status filter are placed after the visible, reordered ones.
    const others = rows.filter((r) => !next.some((n) => n.id === r.id));
    const ordered = [...next, ...others.filter((r) => r.discipline === discipline)];
    setRows([...ordered, ...rows.filter((r) => r.discipline !== discipline)]);
    run(() => reorderProjects(ordered.map((r) => r.id)), "Order saved.");
  };

  const counts = (d: "design" | "data") => rows.filter((r) => r.discipline === d).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Discipline" className="flex gap-2">
          <button type="button" aria-pressed={discipline === "design"} onClick={() => setDiscipline("design")} className={tabCls(discipline === "design")}>
            ■ Design <span className="ml-1 font-mono opacity-60">{counts("design")}</span>
          </button>
          <button type="button" aria-pressed={discipline === "data"} onClick={() => setDiscipline("data")} className={tabCls(discipline === "data")}>
            □ Data <span className="ml-1 font-mono opacity-60">{counts("data")}</span>
          </button>
        </div>
        <div role="group" aria-label="Status" className="micro flex gap-4 font-mono">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={status === s ? "underline underline-offset-4" : "text-muted hover:text-fg"}
            >
              [{s}]
            </button>
          ))}
        </div>
      </div>

      <p className="micro mt-6 h-4 font-mono text-muted" role="status" aria-live="polite">
        {pending ? "Saving…" : msg}
      </p>

      {list.length === 0 ? (
        <div className="mt-4 border border-line p-10 text-center">
          <p className="text-muted">No {status === "all" ? "" : status} {discipline} projects yet.</p>
          <Link href={`/admin/projects/new?discipline=${discipline}`} className="micro mt-6 inline-flex h-10 items-center rounded-full bg-fg px-5 text-bg">
            + Add a {discipline} project
          </Link>
        </div>
      ) : (
        <div className="mt-4 border-t border-line">
          <SortableList items={list} getId={(r) => r.id} onReorder={onReorder}>
            {(r, i) => (
              <div className="flex items-center gap-2 border-b border-line py-2.5 sm:gap-4">
                <DragHandle label={`Drag to reorder ${r.title}`} />
                <span className="hidden w-6 font-mono text-xs text-muted sm:block">{String(i + 1).padStart(2, "0")}</span>
                <div
                  className="hidden size-12 shrink-0 bg-line bg-cover bg-center grayscale sm:block"
                  style={r.cover_url ? { backgroundImage: `url(${r.cover_url})` } : undefined}
                  aria-hidden
                />
                <Link href={`/admin/projects/${r.id}`} className="min-w-0 flex-1 hover:underline">
                  <span className="block truncate font-medium">{r.title}</span>
                  <span className="micro block truncate text-muted">
                    {r.category ?? "Uncategorised"} · {r.year ?? "—"}
                  </span>
                </Link>
                <button
                  type="button"
                  title={r.featured ? "Featured on home — click to remove" : "Feature on home page"}
                  aria-pressed={r.featured}
                  onClick={() => {
                    patch(r.id, { featured: !r.featured });
                    run(() => setProjectFlags(r.id, { featured: !r.featured }), r.featured ? "Removed from home." : "Featured on home.");
                  }}
                  className="grid size-9 place-items-center rounded-full text-lg hover:bg-line"
                >
                  <span aria-hidden>{r.featured ? "★" : "☆"}</span>
                  <span className="sr-only">Featured</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = r.status === "published" ? "draft" : "published";
                    patch(r.id, { status: s });
                    run(() => setProjectFlags(r.id, { status: s }), s === "published" ? "Published." : "Moved to drafts.");
                  }}
                  title={r.status === "published" ? "Unpublish" : "Publish"}
                >
                  <Badge solid={r.status === "published"}>{r.status}</Badge>
                </button>
                <details className="relative">
                  <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full hover:bg-line" aria-label={`More actions for ${r.title}`}>
                    ⋯
                  </summary>
                  <div className="micro absolute right-0 z-20 mt-1 w-44 border border-line-strong bg-bg py-1">
                    <Link href={`/admin/projects/${r.id}`} className="block px-4 py-2 hover:bg-line">Edit</Link>
                    <Link href={`/preview/${r.id}`} target="_blank" className="block px-4 py-2 hover:bg-line">Preview <Arrow /></Link>
                    {r.status === "published" && (
                      <Link href={`/${r.discipline}/${r.slug}`} target="_blank" className="block px-4 py-2 hover:bg-line">View live <Arrow /></Link>
                    )}
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left hover:bg-fg hover:text-bg"
                      onClick={() => {
                        if (!confirm(`Delete “${r.title}” permanently? This can't be undone.`)) return;
                        setRows((rs) => rs.filter((x) => x.id !== r.id));
                        run(() => deleteProject(r.id), "Project deleted.");
                      }}
                    >
                      Delete…
                    </button>
                  </div>
                </details>
              </div>
            )}
          </SortableList>
        </div>
      )}
      <p className="micro mt-6 text-muted">
        Drag rows to set the order on the public site. ★ = shown on the home page.
      </p>
    </div>
  );
}
