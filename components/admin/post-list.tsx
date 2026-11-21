"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deletePost, setPostStatus } from "@/app/admin/actions";
import { Arrow } from "@/components/ui/arrow";
import { Badge } from "./ui";

type Row = {
  id: string;
  title: string;
  slug: string;
  topic: "design" | "data" | "both";
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  updated_at: string;
};

const topicLabel = { design: "Design", data: "Data", both: "Design + Data" } as const;

export function PostList({ posts }: { posts: Row[] }) {
  const [rows, setRows] = useState(posts);
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const list = useMemo(() => rows.filter((r) => status === "all" || r.status === status), [rows, status]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? ok : `✕ ${r.error}`);
    });

  return (
    <div>
      <div role="group" aria-label="Status" className="micro flex gap-4 font-mono">
        {(["all", "published", "draft"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
            className={status === s ? "text-accent-text underline underline-offset-4" : "text-muted hover:text-accent-text"}
          >
            [{s}]
          </button>
        ))}
      </div>
      <p className="micro mt-6 h-4 font-mono text-muted" role="status" aria-live="polite">
        {pending ? "Saving…" : msg}
      </p>

      {list.length === 0 ? (
        <div className="mt-4 border border-line p-10 text-center">
          <p className="text-muted">No {status === "all" ? "" : status} thoughts yet.</p>
          <Link href="/admin/thoughts/new" className="micro mt-6 inline-flex h-10 items-center rounded-full bg-fg px-5 text-bg transition-colors hover:bg-accent hover:text-ink">
            + Write your first thought
          </Link>
        </div>
      ) : (
        <ul className="mt-4 border-t border-line">
          {list.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-b border-line py-3 sm:gap-4">
              <Link href={`/admin/thoughts/${r.id}`} className="min-w-0 flex-1 hover:underline">
                <span className="block truncate font-medium">
                  {r.featured && <span aria-label="Pinned">★ </span>}
                  {r.title}
                </span>
                <span className="micro block truncate text-muted">
                  {topicLabel[r.topic]} · {r.published_at ? new Date(r.published_at).toLocaleDateString() : "Not published"}
                </span>
              </Link>
              <button
                type="button"
                title={r.status === "published" ? "Unpublish" : "Publish"}
                onClick={() => {
                  const s = r.status === "published" ? "draft" : "published";
                  setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: s } : x)));
                  run(() => setPostStatus(r.id, s), s === "published" ? "Published." : "Moved to drafts.");
                }}
              >
                <Badge solid={r.status === "published"}>{r.status}</Badge>
              </button>
              <details className="relative">
                <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full hover:bg-accent/15 hover:text-accent-text" aria-label={`More actions for ${r.title}`}>
                  ⋯
                </summary>
                <div className="micro absolute right-0 z-20 mt-1 w-44 border border-line-strong bg-bg py-1">
                  <Link href={`/admin/thoughts/${r.id}`} className="block px-4 py-2 hover:bg-accent/15 hover:text-accent-text">
                    Edit
                  </Link>
                  <Link href={`/preview/thought/${r.id}`} target="_blank" className="block px-4 py-2 hover:bg-accent/15 hover:text-accent-text">
                    Preview <Arrow />
                  </Link>
                  {r.status === "published" && (
                    <Link href={`/thoughts/${r.slug}`} target="_blank" className="block px-4 py-2 hover:bg-accent/15 hover:text-accent-text">
                      View live <Arrow />
                    </Link>
                  )}
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left hover:border-accent hover:bg-accent hover:text-ink"
                    onClick={() => {
                      if (!confirm(`Delete “${r.title}” permanently? This can't be undone.`)) return;
                      setRows((rs) => rs.filter((x) => x.id !== r.id));
                      run(() => deletePost(r.id), "Thought deleted.");
                    }}
                  >
                    Delete…
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
