"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { deleteMedia, updateMediaAlt } from "@/app/admin/actions";
import { ACCEPT, formatBytes, uploadFile, type MediaRow } from "@/lib/admin/upload";
import { btnGhost, btnPrimary, inputCls } from "./ui";

type Job = { name: string; state: "uploading" | "done" | "error"; error?: string };

export function MediaLibrary({ initial, usage }: { initial: MediaRow[]; usage: Record<string, string[]> }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "image" | "video" | "doc">("all");
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const arr = Array.from(files);
    setJobs((j) => [...arr.map((f) => ({ name: f.name, state: "uploading" as const })), ...j]);
    await Promise.all(
      arr.map(async (f) => {
        try {
          const row = await uploadFile(f);
          setItems((it) => [row, ...it]);
          setJobs((j) => j.map((x) => (x.name === f.name && x.state === "uploading" ? { ...x, state: "done" } : x)));
        } catch (e) {
          const error = e instanceof Error ? e.message : "Upload failed";
          setJobs((j) => j.map((x) => (x.name === f.name && x.state === "uploading" ? { ...x, state: "error", error } : x)));
        }
      }),
    );
    router.refresh();
  }

  const shown = useMemo(
    () =>
      items.filter((m) => {
        const t = m.mime ?? "";
        const okType =
          type === "all" ||
          (type === "image" && t.startsWith("image/")) ||
          (type === "video" && t.startsWith("video/")) ||
          (type === "doc" && !t.startsWith("image/") && !t.startsWith("video/"));
        return okType && (!q || `${m.alt ?? ""} ${m.path}`.toLowerCase().includes(q.toLowerCase()));
      }),
    [items, q, type],
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files);
        }}
        className={`grid place-items-center border border-dashed p-10 text-center transition-colors ${over ? "border-accent bg-accent/10" : "border-line-strong"}`}
      >
        <p className="text-lg">Drop files to upload</p>
        <p className="micro mt-2 text-muted">Images incl. SVG logos (auto-converted to WebP) · MP4/WebM · PDF · CSV/JSON — images ≤ 20 MB, video ≤ 50 MB</p>
        <button type="button" onClick={() => input.current?.click()} className={`${btnPrimary} mt-6`}>
          Choose files
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT.any}
          hidden
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {jobs.length > 0 && (
        <ul className="mt-4 space-y-1 font-mono text-xs" aria-live="polite">
          {jobs.slice(0, 8).map((j, i) => (
            <li key={i} className="flex items-center gap-3 border-b border-line py-2">
              <span className="w-24">
                {j.state === "uploading" ? (
                  <span className="relative block h-1 overflow-hidden bg-line">
                    <span className="absolute inset-y-0 w-1/3 animate-[marquee_1s_linear_infinite] bg-accent" />
                  </span>
                ) : j.state === "done" ? (
                  "✓ done"
                ) : (
                  "✕ failed"
                )}
              </span>
              <span className="truncate">{j.error ?? j.name}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="File type" className="micro flex gap-4 font-mono">
          {(["all", "image", "video", "doc"] as const).map((t) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={type === t ? "text-accent-text underline underline-offset-4" : "text-muted hover:text-accent-text"}>
              [{t}]
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alt text or filename…" className={`${inputCls} max-w-xs`} />
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No files{q || type !== "all" ? " match" : " yet"}.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {shown.map((m) => {
            const used = usage[m.id] ?? [];
            const isImg = m.mime?.startsWith("image/");
            const isVid = m.mime?.startsWith("video/");
            return (
              <li key={m.id} className="min-w-0">
                <a href={m.url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-line">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="size-full object-cover" />
                  ) : isVid ? (
                    <video src={m.url} muted className="size-full object-cover" />
                  ) : (
                    <span className="micro grid size-full place-items-center font-mono">{m.mime?.split("/")[1]?.toUpperCase()}</span>
                  )}
                </a>
                <p className="micro mt-2 truncate font-mono text-muted" title={m.path}>
                  {m.path.split("/").pop()}
                </p>
                <p className="micro font-mono text-muted">
                  {formatBytes(m.size_bytes)}
                  {m.width ? ` · ${m.width}×${m.height}` : ""}
                </p>
                {isImg && (
                  <input
                    defaultValue={m.alt ?? ""}
                    placeholder="Alt text…"
                    aria-label={`Alt text for ${m.path.split("/").pop()}`}
                    onBlur={(e) => e.target.value !== (m.alt ?? "") && updateMediaAlt(m.id, e.target.value)}
                    className={`${inputCls} mt-2 py-1.5 text-xs`}
                  />
                )}
                <p className="micro mt-2 truncate" title={used.join(", ")}>
                  {used.length ? `Used in: ${used.join(", ")}` : <span className="text-muted">Not used</span>}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(m.url);
                      setCopied(m.id);
                      setTimeout(() => setCopied(null), 1500);
                    }}
                    className={`${btnGhost} h-8 px-3`}
                  >
                    {copied === m.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const warn = used.length ? `\n\nIt's still used in: ${used.join(", ")}. Those places will show a broken file.` : "";
                      if (!confirm(`Delete this file permanently? This can't be undone.${warn}`)) return;
                      const r = await deleteMedia(m.id);
                      if (r.ok) setItems((it) => it.filter((x) => x.id !== m.id));
                      else alert(r.error);
                    }}
                    className={`${btnGhost} h-8 px-3 hover:border-accent hover:bg-accent hover:text-ink`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
