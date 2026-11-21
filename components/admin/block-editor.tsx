"use client";

import { useState } from "react";
import type { Block, ImageRef } from "@/lib/types";
import { MediaField } from "./media-field";
import { DragHandle, SortableList } from "./sortable";
import { Field, btnGhost, inputCls } from "./ui";

export type KeyedBlock = Block & { _k: string };

const newKey = () => Math.random().toString(36).slice(2, 10);
export const withKeys = (bs: Block[]): KeyedBlock[] => bs.map((b) => ({ ...b, _k: newKey() }) as KeyedBlock);
export const stripKeys = (bs: KeyedBlock[]): Block[] =>
  bs.map((b) => {
    const { _k, ...rest } = b;
    void _k;
    return rest as Block;
  });

const LABELS: Record<Block["type"], string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  "full-image": "Full-width image",
  "image-grid": "Image grid",
  video: "Video",
  quote: "Quote",
  code: "Code",
  chart: "Chart",
  embed: "Embed",
  metrics: "Metrics",
  divider: "Divider",
};

const blank = (type: Block["type"]): Block => {
  switch (type) {
    case "heading": return { type, text: "" };
    case "text": return { type, text: "" };
    case "image":
    case "full-image": return { type, url: null, alt: "" };
    case "image-grid": return { type, columns: 2, images: [{ url: null, alt: "" }, { url: null, alt: "" }] };
    case "video": return { type, url: "" };
    case "quote": return { type, text: "" };
    case "code": return { type, language: "sql", code: "" };
    case "chart": return { type, kind: "line", title: "", xKey: "x", series: [], data: [] };
    case "embed": return { type, url: "", title: "", ratio: "16 / 9" };
    case "metrics": return { type, items: [{ label: "", value: "" }] };
    case "divider": return { type };
  }
};

// Which blocks each discipline offers first (all remain available).
const ORDER: Record<"design" | "data", Block["type"][]> = {
  design: ["text", "heading", "full-image", "image", "image-grid", "video", "quote", "divider", "embed", "metrics", "code", "chart"],
  data: ["text", "heading", "chart", "metrics", "code", "embed", "image", "full-image", "image-grid", "quote", "video", "divider"],
};

/** Minimal CSV → rows. First row is the header; numeric cells become numbers. */
export function parseCsv(src: string) {
  const rows: string[][] = [];
  for (const line of src.trim().split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === "," || ch === ";" || ch === "\t") { cells.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  const [head, ...body] = rows;
  if (!head || head.length < 2) throw new Error("Need a header row and at least two columns.");
  const data = body.map((r) =>
    Object.fromEntries(head.map((h, i) => {
      const v = r[i] ?? "";
      const n = Number(v.replace(/[, ]/g, ""));
      return [h, v !== "" && !Number.isNaN(n) && i > 0 ? n : v];
    })),
  );
  return { xKey: head[0], series: head.slice(1), data };
}

const toCsv = (b: Extract<Block, { type: "chart" }>) =>
  b.data.length ? [[b.xKey, ...b.series].join(","), ...b.data.map((r) => [b.xKey, ...b.series].map((k) => r[k] ?? "").join(","))].join("\n") : "";

function ChartEditor({ b, set }: { b: Extract<Block, { type: "chart" }>; set: (p: Partial<Block>) => void }) {
  const [csv, setCsv] = useState(() => toCsv(b));
  const [err, setErr] = useState<string | null>(null);
  const apply = (text: string) => {
    setCsv(text);
    if (!text.trim()) return set({ data: [], series: [] } as Partial<Block>);
    try {
      set(parseCsv(text) as Partial<Block>);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't read CSV");
    }
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Chart type">
        <select value={b.kind} onChange={(e) => set({ kind: e.target.value } as Partial<Block>)} className={inputCls}>
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
        </select>
      </Field>
      <Field label="Title">
        <input value={b.title ?? ""} onChange={(e) => set({ title: e.target.value } as Partial<Block>)} className={inputCls} />
      </Field>
      <Field
        label="Data (CSV)"
        className="sm:col-span-2"
        hint={b.data.length ? `${b.data.length} rows · x = ${b.xKey} · series = ${b.series.join(", ")}` : "First column = x axis, other columns = series. Paste from Excel/Sheets or import a file."}
        error={err ?? undefined}
      >
        <textarea value={csv} onChange={(e) => apply(e.target.value)} rows={6} placeholder={"month,Before,After\nJan,100,100\nFeb,71,78"} className={`${inputCls} font-mono`} />
      </Field>
      <label className={`${btnGhost} w-fit cursor-pointer`}>
        Import .csv / .json
        <input
          type="file"
          accept=".csv,text/csv,.json,application/json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const text = await f.text();
            if (f.name.endsWith(".json")) {
              try {
                const rows = JSON.parse(text) as Record<string, string | number>[];
                const keys = Object.keys(rows[0] ?? {});
                apply([keys.join(","), ...rows.map((r) => keys.map((k) => r[k]).join(","))].join("\n"));
              } catch {
                setErr("JSON must be an array of objects, e.g. [{\"month\":\"Jan\",\"sales\":10}]");
              }
            } else apply(text);
            e.target.value = "";
          }}
        />
      </label>
      <Field label="Caption" className="sm:col-span-2">
        <input value={b.caption ?? ""} onChange={(e) => set({ caption: e.target.value } as Partial<Block>)} className={inputCls} />
      </Field>
    </div>
  );
}

function BlockFields({ b, set, altErrors }: { b: Block; set: (p: Partial<Block>) => void; altErrors: boolean }) {
  const s = set as (p: Record<string, unknown>) => void;
  switch (b.type) {
    case "heading":
      return <input value={b.text} onChange={(e) => s({ text: e.target.value })} placeholder="Section heading" className={`${inputCls} text-lg`} />;
    case "text":
      return (
        <Field label="Text" hint="Leave a blank line between paragraphs.">
          <textarea value={b.text} onChange={(e) => s({ text: e.target.value })} rows={6} className={inputCls} />
        </Field>
      );
    case "image":
    case "full-image":
      return (
        <div className="space-y-4">
          <MediaField label="Image" url={b.url} alt={b.alt} altError={altErrors && !!b.url && !b.alt?.trim()} onChange={(v) => s({ url: v.url, alt: v.alt ?? b.alt })} />
          <Field label="Caption (optional)">
            <input value={b.caption ?? ""} onChange={(e) => s({ caption: e.target.value })} className={inputCls} />
          </Field>
        </div>
      );
    case "image-grid": {
      const setImg = (i: number, p: Partial<ImageRef>) => s({ images: b.images.map((im, j) => (j === i ? { ...im, ...p } : im)) });
      return (
        <div className="space-y-5">
          <Field label="Columns">
            <select value={b.columns} onChange={(e) => s({ columns: Number(e.target.value) })} className={`${inputCls} max-w-40`}>
              <option value={2}>2 up</option>
              <option value={3}>3 up</option>
            </select>
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            {b.images.map((im, i) => (
              <div key={i} className="space-y-2 border border-line p-3">
                <MediaField label={`Image ${i + 1}`} url={im.url} alt={im.alt} altError={altErrors && !!im.url && !im.alt?.trim()} onChange={(v) => setImg(i, { url: v.url, alt: v.alt ?? im.alt })} />
                <button type="button" onClick={() => s({ images: b.images.filter((_, j) => j !== i) })} className="micro text-muted hover:text-accent-text hover:underline">
                  Remove image
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => s({ images: [...b.images, { url: null, alt: "" }] })} className={btnGhost}>
            + Add image
          </button>
        </div>
      );
    }
    case "video":
      return (
        <div className="space-y-4">
          <MediaField label="Video (MP4/WebM, max 50 MB)" kind="video" url={b.url} onChange={(v) => s({ url: v.url ?? "" })} />
          <Field label="Caption (optional)">
            <input value={b.caption ?? ""} onChange={(e) => s({ caption: e.target.value })} className={inputCls} />
          </Field>
        </div>
      );
    case "quote":
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Quote" className="sm:col-span-2">
            <textarea value={b.text} onChange={(e) => s({ text: e.target.value })} rows={3} className={inputCls} />
          </Field>
          <Field label="Who said it">
            <input value={b.cite ?? ""} onChange={(e) => s({ cite: e.target.value })} className={inputCls} />
          </Field>
        </div>
      );
    case "code":
      return (
        <div className="space-y-4">
          <Field label="Language">
            <input value={b.language ?? ""} onChange={(e) => s({ language: e.target.value })} placeholder="sql, python, dax…" className={`${inputCls} max-w-48`} />
          </Field>
          <textarea value={b.code} onChange={(e) => s({ code: e.target.value })} rows={8} spellCheck={false} className={`${inputCls} font-mono`} />
        </div>
      );
    case "chart":
      return <ChartEditor b={b} set={set} />;
    case "embed":
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Embed URL (https)" hint="Power BI 'Publish to web', Tableau Public, Looker Studio, Figma, YouTube…" className="sm:col-span-3">
            <input value={b.url} onChange={(e) => s({ url: e.target.value })} type="url" className={inputCls} />
          </Field>
          <Field label="Title (for accessibility)" className="sm:col-span-2">
            <input value={b.title} onChange={(e) => s({ title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Aspect ratio">
            <select value={b.ratio ?? "16 / 9"} onChange={(e) => s({ ratio: e.target.value })} className={inputCls}>
              <option>16 / 9</option>
              <option>4 / 3</option>
              <option>1 / 1</option>
              <option>3 / 4</option>
            </select>
          </Field>
        </div>
      );
    case "metrics":
      return (
        <MetricsEditor items={b.items} onChange={(items) => s({ items })} />
      );
    case "divider":
      return <p className="text-sm text-muted">A thin line between sections.</p>;
  }
}

export function MetricsEditor({
  items,
  onChange,
}: {
  items: { label: string; value: string }[];
  onChange: (items: { label: string; value: string }[]) => void;
}) {
  const setAt = (i: number, p: Partial<{ label: string; value: string }>) =>
    onChange(items.map((m, j) => (j === i ? { ...m, ...p } : m)));
  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={i} className="flex gap-2">
          <input value={m.value} onChange={(e) => setAt(i, { value: e.target.value })} placeholder="−23%" aria-label={`Metric ${i + 1} value`} className={`${inputCls} w-32 font-mono`} />
          <input value={m.label} onChange={(e) => setAt(i, { label: e.target.value })} placeholder="Churn reduction" aria-label={`Metric ${i + 1} label`} className={inputCls} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove metric ${i + 1}`} className="px-3 text-muted hover:text-accent-text">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { label: "", value: "" }])} className={btnGhost}>
        + Add metric
      </button>
    </div>
  );
}

export function BlockEditor({
  blocks,
  onChange,
  discipline,
  altErrors,
}: {
  blocks: KeyedBlock[];
  onChange: (b: KeyedBlock[]) => void;
  discipline: "design" | "data";
  altErrors: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const update = (k: string, p: Partial<Block>) =>
    onChange(blocks.map((b) => (b._k === k ? ({ ...b, ...p } as KeyedBlock) : b)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {blocks.length === 0 && (
        <p className="border border-dashed border-line-strong p-8 text-center text-sm text-muted">
          No content blocks yet. Add text, images{discipline === "data" ? ", charts" : ""} and more below.
        </p>
      )}
      <div className="space-y-3">
        <SortableList items={blocks} getId={(b) => b._k} onReorder={onChange}>
          {(b, i) => (
            <section className="border border-line" aria-label={`Block ${i + 1}: ${LABELS[b.type]}`}>
              <header className="flex items-center gap-2 border-b border-line px-2 py-1.5">
                <DragHandle label={`Drag block ${i + 1}`} />
                <span className="micro font-mono">
                  {String(i + 1).padStart(2, "0")} — {LABELS[b.type]}
                </span>
                <div className="micro ml-auto flex items-center">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="size-8 rounded-full hover:bg-accent/15 hover:text-accent-text disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down" className="size-8 rounded-full hover:bg-accent/15 hover:text-accent-text disabled:opacity-30">↓</button>
                  <button
                    type="button"
                    onClick={() => onChange([...blocks.slice(0, i + 1), { ...structuredClone(stripKeys([b])[0]), _k: newKey() } as KeyedBlock, ...blocks.slice(i + 1)])}
                    className="h-8 rounded-full px-3 hover:bg-accent/15 hover:text-accent-text"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(`Remove this ${LABELS[b.type].toLowerCase()} block?`) && onChange(blocks.filter((x) => x._k !== b._k))}
                    className="h-8 rounded-full px-3 hover:border-accent hover:bg-accent hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </header>
              <div className="p-4">
                <BlockFields b={b} set={(p) => update(b._k, p)} altErrors={altErrors} />
              </div>
            </section>
          )}
        </SortableList>
      </div>

      <div className="mt-4">
        {adding ? (
          <div className="border border-line p-3">
            <p className="micro mb-3 font-mono text-muted">Add a block</p>
            <div className="flex flex-wrap gap-2">
              {ORDER[discipline].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange([...blocks, { ...blank(t), _k: newKey() } as KeyedBlock]);
                    setAdding(false);
                  }}
                  className={btnGhost}
                >
                  {LABELS[t]}
                </button>
              ))}
              <button type="button" onClick={() => setAdding(false)} className="micro px-3 text-muted hover:text-accent-text">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={`${btnGhost} w-full border-dashed`}>
            + Add block
          </button>
        )}
      </div>
    </div>
  );
}
