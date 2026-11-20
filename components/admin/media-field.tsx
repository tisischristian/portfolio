"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ACCEPT, formatBytes, uploadFile, type MediaRow } from "@/lib/admin/upload";
import { Field, btnGhost, inputCls } from "./ui";

type Kind = "image" | "video" | "pdf";

function Thumb({ url, mime }: { url: string; mime?: string | null }) {
  if (mime?.startsWith("video/") || /\.(mp4|webm)$/i.test(url))
    return <video src={url} muted className="size-full object-cover" />;
  if (mime === "application/pdf" || /\.pdf$/i.test(url))
    return <span className="micro grid size-full place-items-center font-mono">PDF</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="size-full object-cover" />;
}

/** Modal listing the media library; returns the chosen row. */
export function MediaPicker({
  kind,
  onPick,
  onClose,
}: {
  kind: Kind;
  onPick: (m: MediaRow) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaRow[] | null>(null);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
    const prefix = kind === "pdf" ? "application/pdf" : `${kind}/`;
    createClient()
      .from("media")
      .select("*")
      .like("mime", `${prefix}%`)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setItems((data as MediaRow[]) ?? []));
  }, [kind]);

  const shown = (items ?? []).filter((m) => !q || `${m.alt ?? ""} ${m.path}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[85svh] w-[min(960px,calc(100vw-32px))] border border-line-strong bg-bg p-0 text-fg backdrop:bg-black/70"
    >
      <div className="flex max-h-[85svh] flex-col bg-bg text-fg">
        <div className="flex items-center gap-4 border-b border-line p-4">
          <h2 id={titleId} className="micro font-mono">{"// Media library"}</h2>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${inputCls} ml-auto max-w-56`} />
          <button type="button" onClick={() => ref.current?.close()} className={btnGhost}>
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {items === null ? (
            <p className="micro font-mono text-muted">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted">No {kind} files yet — use Upload instead.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {shown.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(m);
                      ref.current?.close();
                    }}
                    className="group block w-full text-left"
                  >
                    <div className="aspect-square overflow-hidden bg-line outline-offset-2 group-hover:outline group-hover:outline-1 group-hover:outline-fg">
                      <Thumb url={m.url} mime={m.mime} />
                    </div>
                    <p className="micro mt-1.5 truncate text-muted">{m.alt || m.path.split("/").pop()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}

/**
 * URL field with Upload + Library buttons and (for images) required alt text.
 * Emits url and alt separately so callers can map them onto any shape.
 */
export function MediaField({
  label,
  kind = "image",
  url,
  alt,
  onChange,
  withAlt = kind === "image",
  altError,
}: {
  label: string;
  kind?: Kind;
  url: string | null | undefined;
  alt?: string | null;
  onChange: (v: { url: string | null; alt?: string }) => void;
  withAlt?: boolean;
  altError?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const accept = kind === "image" ? ACCEPT.image : kind === "video" ? ACCEPT.video : ACCEPT.pdf;

  async function onFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setErr(null);
    try {
      const m = await uploadFile(f, alt ?? "");
      onChange({ url: m.url, alt: alt || m.alt || "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <span className="micro block font-mono text-muted">{label}</span>
      <div
        className="flex items-center gap-4 border border-dashed border-line-strong p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="size-20 shrink-0 overflow-hidden bg-line">{url && <Thumb url={url} />}</div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate font-mono text-xs text-muted">{busy ? "Uploading…" : url ? url.split("/").pop() : "Drop a file here, or"}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => file.current?.click()} className={btnGhost}>
              Upload
            </button>
            <button type="button" disabled={busy} onClick={() => setPicking(true)} className={btnGhost}>
              Library
            </button>
            {url && (
              <button type="button" onClick={() => onChange({ url: null, alt: "" })} className={`${btnGhost} text-muted`}>
                Remove
              </button>
            )}
          </div>
        </div>
        <input ref={file} type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {err && <p className="micro font-mono">✕ {err}</p>}
      {withAlt && url && (
        <Field label="Alt text (required)" hint="Describe the image for screen readers and search engines." error={altError ? "Alt text is required" : undefined}>
          <input
            value={alt ?? ""}
            onChange={(e) => onChange({ url, alt: e.target.value })}
            aria-invalid={altError || undefined}
            className={inputCls}
          />
        </Field>
      )}
      {picking && (
        <MediaPicker
          kind={kind}
          onClose={() => setPicking(false)}
          onPick={(m) => onChange({ url: m.url, alt: alt || m.alt || "" })}
        />
      )}
    </div>
  );
}

export { formatBytes };
