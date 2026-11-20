"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { saveProject, type ProjectInput } from "@/app/admin/actions";
import type { Block, Project } from "@/lib/types";
import { BlockEditor, MetricsEditor, stripKeys, withKeys, type KeyedBlock } from "./block-editor";
import { MediaField } from "./media-field";
import { Badge, Field, btnGhost, btnPrimary, inputCls } from "./ui";
import { Arrow } from "@/components/ui/arrow";

export type EditableProject = Omit<Project, "id" | "sort_order" | "published_at"> & { id?: string };

const CATEGORIES = {
  design: ["Visual Identity", "Graphic Design", "Packaging", "Typography", "Editorial", "Poster", "Illustration"],
  data: ["Analysis", "Dashboard", "Visualization", "Machine Learning", "SQL", "Python", "Forecasting"],
};
const TOOLS = ["Python", "Pandas", "SQL", "Excel", "Power BI", "DAX", "Tableau", "R", "Looker Studio", "scikit-learn", "Matplotlib"];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const join = (a: string[] | null | undefined) => (a ?? []).join(", ");

function hasMissingAlt(b: Block) {
  if (b.type === "image" || b.type === "full-image") return !!b.url && !b.alt?.trim();
  if (b.type === "image-grid") return b.images.some((i) => !!i.url && !i.alt?.trim());
  return false;
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-10 lg:grid-cols-[220px_1fr]">
      <h2 className="micro font-mono text-muted">{`// ${n} — ${title}`}</h2>
      <div className="min-w-0 space-y-6">{children}</div>
    </section>
  );
}

export function ProjectForm({ initial, justSaved }: { initial: EditableProject; justSaved?: string }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [blocks, setBlocks] = useState<KeyedBlock[]>(() => withKeys(initial.blocks));
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [dirty, setDirty] = useState(false);
  const [altErrors, setAltErrors] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(
    justSaved ? { ok: true, text: justSaved === "published" ? "Created and published." : "Created." } : null,
  );
  const [pending, start] = useTransition();

  // Text inputs for comma lists keep raw text so typing ", " isn't swallowed.
  const [raw, setRaw] = useState({
    tags: join(initial.tags),
    deliverables: join(initial.deliverables),
    fonts: join(initial.fonts),
    tools: join(initial.tools),
  });

  const set = <K extends keyof EditableProject>(k: K, v: EditableProject[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };
  const isDesign = p.discipline === "design";

  const save = useCallback(
    (status?: "draft" | "published") => {
      const finalBlocks = stripKeys(blocks);
      const missingAlt = (p.cover_url && !p.cover_alt?.trim()) || finalBlocks.some(hasMissingAlt);
      if (missingAlt) {
        setAltErrors(true);
        setMsg({ ok: false, text: "Every image needs alt text — the empty fields are marked." });
        return;
      }
      const payload: ProjectInput = {
        ...p,
        status: status ?? p.status,
        tags: list(raw.tags),
        deliverables: list(raw.deliverables),
        fonts: list(raw.fonts),
        tools: list(raw.tools),
        metrics: p.metrics.filter((m) => m.label.trim() && m.value.trim()),
        palette: (p.palette ?? []).filter(Boolean),
        blocks: finalBlocks as ProjectInput["blocks"],
      };
      start(async () => {
        const r = await saveProject(payload);
        if (!r.ok) return setMsg({ ok: false, text: r.error });
        setDirty(false);
        setAltErrors(false);
        if (status) setP((x) => ({ ...x, status }));
        setMsg({ ok: true, text: status === "published" ? "Published — live within a few seconds." : "Saved." });
        if (!p.id && r.id) router.replace(`/admin/projects/${r.id}?saved=${status ?? "saved"}`);
        else router.refresh();
      });
    },
    [blocks, p, raw, router],
  );

  // Ctrl/Cmd+S saves; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [save, dirty]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 -mx-4 mb-2 flex flex-wrap items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-12 lg:px-12">
        <Link href="/admin/projects" className="micro text-muted hover:text-fg">
          ← Projects
        </Link>
        <Badge>{isDesign ? "■ Design" : "□ Data"}</Badge>
        <Badge solid={p.status === "published"}>{p.status}</Badge>
        {dirty && <span className="micro font-mono text-muted">• Unsaved</span>}
        <p role="status" aria-live="polite" className="micro font-mono">
          {pending ? "Saving…" : msg && (msg.ok ? msg.text : `✕ ${msg.text}`)}
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          {p.id && (
            <a href={`/preview/${p.id}`} target="_blank" rel="noreferrer" className={btnGhost}>
              Preview <Arrow />
            </a>
          )}
          <button type="submit" disabled={pending} className={btnGhost}>
            Save
          </button>
          {p.status === "published" ? (
            <button type="button" disabled={pending} onClick={() => save("draft")} className={btnGhost}>
              Unpublish
            </button>
          ) : null}
          <button type="button" disabled={pending} onClick={() => save("published")} className={btnPrimary}>
            {p.status === "published" ? "Update live" : "Publish"}
          </button>
        </div>
      </div>

      <Section n="01" title="Basics">
        <Field label="Title *">
          <input
            value={p.title}
            required
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className={`${inputCls} text-lg`}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="URL slug *" hint={`/${p.discipline}/${p.slug || "…"}`} className="sm:col-span-2">
            <input
              value={p.slug}
              required
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className={`${inputCls} font-mono`}
            />
          </Field>
          <Field label="Year">
            <input
              type="number"
              min={1900}
              max={2100}
              value={p.year ?? ""}
              onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)}
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category">
            <input list="categories" value={p.category ?? ""} onChange={(e) => set("category", e.target.value)} className={inputCls} />
            <datalist id="categories">
              {CATEGORIES[p.discipline].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Tags" hint="Comma separated">
            <input value={raw.tags} onChange={(e) => (setRaw({ ...raw, tags: e.target.value }), setDirty(true))} className={inputCls} />
          </Field>
        </div>
        <Field label="Summary" hint="One or two sentences. Shown on cards and as the overview.">
          <textarea value={p.summary ?? ""} onChange={(e) => set("summary", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-current" />
          Feature on the home page ★
        </label>
      </Section>

      <Section n="02" title="Cover">
        <MediaField
          label="Cover image"
          url={p.cover_url}
          alt={p.cover_alt}
          altError={altErrors && !!p.cover_url && !p.cover_alt?.trim()}
          onChange={(v) => {
            set("cover_url", v.url);
            set("cover_alt", v.alt ?? p.cover_alt);
          }}
        />
        {!isDesign && <p className="text-xs text-muted">Optional for data projects — the card shows generated chart art when empty.</p>}
      </Section>

      {isDesign ? (
        <Section n="03" title="Design details">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Client">
              <input value={p.client ?? ""} onChange={(e) => set("client", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Your role">
              <input value={p.role ?? ""} onChange={(e) => set("role", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Deliverables" hint="Comma separated — e.g. Logo system, Packaging, Guidelines">
            <input value={raw.deliverables} onChange={(e) => (setRaw({ ...raw, deliverables: e.target.value }), setDirty(true))} className={inputCls} />
          </Field>
          <div>
            <span className="micro mb-2 block font-mono text-muted">Brand colours</span>
            <div className="flex flex-wrap gap-3">
              {(p.palette ?? []).map((hex, i) => (
                <div key={i} className="flex items-center gap-1 border border-line p-1.5">
                  <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"}
                    onChange={(e) => set("palette", (p.palette ?? []).map((h, j) => (j === i ? e.target.value.toUpperCase() : h)))}
                    aria-label={`Colour ${i + 1}`}
                    className="size-8 cursor-pointer bg-transparent"
                  />
                  <input
                    value={hex}
                    onChange={(e) => set("palette", (p.palette ?? []).map((h, j) => (j === i ? e.target.value : h)))}
                    aria-label={`Colour ${i + 1} hex`}
                    className="w-20 bg-transparent font-mono text-xs outline-none"
                  />
                  <button type="button" onClick={() => set("palette", (p.palette ?? []).filter((_, j) => j !== i))} aria-label={`Remove colour ${i + 1}`} className="px-1 text-muted hover:text-fg">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set("palette", [...(p.palette ?? []), "#000000"])} className={btnGhost}>
                + Colour
              </button>
            </div>
          </div>
          <Field label="Typefaces" hint="Comma separated, primary first">
            <input value={raw.fonts} onChange={(e) => (setRaw({ ...raw, fonts: e.target.value }), setDirty(true))} className={inputCls} />
          </Field>
        </Section>
      ) : (
        <Section n="03" title="Data details">
          <Field label="Business question" hint="The problem in one sentence.">
            <textarea value={p.question ?? ""} onChange={(e) => set("question", e.target.value)} rows={2} className={inputCls} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Dataset source">
              <input value={p.dataset_source ?? ""} onChange={(e) => set("dataset_source", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Dataset size" hint="e.g. 48K rows · 12 cols">
              <input value={p.dataset_size ?? ""} onChange={(e) => set("dataset_size", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Tools" hint="Comma separated, or tap a suggestion">
            <input value={raw.tools} onChange={(e) => (setRaw({ ...raw, tools: e.target.value }), setDirty(true))} className={inputCls} />
          </Field>
          <div className="-mt-3 flex flex-wrap gap-1.5">
            {TOOLS.filter((t) => !list(raw.tools).includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => (setRaw({ ...raw, tools: [...list(raw.tools), t].join(", ") }), setDirty(true))}
                className="micro h-7 rounded-full border border-line px-2.5 font-mono text-muted hover:border-fg hover:text-fg"
              >
                + {t}
              </button>
            ))}
          </div>
          <div>
            <span className="micro mb-2 block font-mono text-muted">Key results (first one shows on the card)</span>
            <MetricsEditor items={p.metrics} onChange={(m) => set("metrics", m)} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Live dashboard embed URL" hint="Power BI / Tableau / Looker Studio public link (https)">
              <input type="url" value={p.embed_url ?? ""} onChange={(e) => set("embed_url", e.target.value)} className={inputCls} />
            </Field>
            <Field label="GitHub URL">
              <input type="url" value={p.github_url ?? ""} onChange={(e) => set("github_url", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Notebook URL" hint="Kaggle, Colab, nbviewer…">
              <input type="url" value={p.notebook_url ?? ""} onChange={(e) => set("notebook_url", e.target.value)} className={inputCls} />
            </Field>
          </div>
          <MediaField label="Report (PDF)" kind="pdf" url={p.report_url} onChange={(v) => set("report_url", v.url)} />
        </Section>
      )}

      <Section n="04" title={isDesign ? "Case study" : "Method & insights"}>
        <BlockEditor
          blocks={blocks}
          discipline={p.discipline}
          altErrors={altErrors}
          onChange={(b) => {
            setBlocks(b);
            setDirty(true);
          }}
        />
      </Section>

      <Section n="05" title="Search (SEO)">
        <Field label="SEO title" hint="Defaults to the project title">
          <input value={p.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="SEO description" hint="Defaults to the summary. ~155 characters.">
          <textarea value={p.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} rows={2} maxLength={300} className={inputCls} />
        </Field>
      </Section>
    </form>
  );
}
