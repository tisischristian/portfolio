"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { savePost, type PostInput } from "@/app/admin/actions";
import { Arrow } from "@/components/ui/arrow";
import type { Block, Post, PostTopic } from "@/lib/types";
import { BlockEditor, stripKeys, withKeys, type KeyedBlock } from "./block-editor";
import { MediaField } from "./media-field";
import { Badge, Field, btnGhost, btnPrimary, inputCls } from "./ui";

export type EditablePost = Omit<Post, "id" | "published_at" | "updated_at"> & { id?: string };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

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

export function PostForm({ initial, justSaved }: { initial: EditablePost; justSaved?: string }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [blocks, setBlocks] = useState<KeyedBlock[]>(() => withKeys(initial.blocks));
  const [tags, setTags] = useState(initial.tags.join(", "));
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [dirty, setDirty] = useState(false);
  const [altErrors, setAltErrors] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(
    justSaved ? { ok: true, text: justSaved === "published" ? "Created and published." : "Draft created." } : null,
  );
  const [pending, start] = useTransition();

  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };

  const save = useCallback(
    (status?: "draft" | "published") => {
      const finalBlocks = stripKeys(blocks);
      if ((p.cover_url && !p.cover_alt?.trim()) || finalBlocks.some(hasMissingAlt)) {
        setAltErrors(true);
        setMsg({ ok: false, text: "Every image needs alt text — the empty fields are marked." });
        return;
      }
      const payload: PostInput = { ...p, status: status ?? p.status, tags: list(tags), blocks: finalBlocks as PostInput["blocks"] };
      start(async () => {
        const r = await savePost(payload);
        if (!r.ok) return setMsg({ ok: false, text: r.error });
        setDirty(false);
        setAltErrors(false);
        if (status) setP((x) => ({ ...x, status }));
        setMsg({ ok: true, text: status === "published" ? "Published — live within a few seconds." : "Saved." });
        if (!p.id && r.id) router.replace(`/admin/thoughts/${r.id}?saved=${status ?? "saved"}`);
        else router.refresh();
      });
    },
    [blocks, p, tags, router],
  );

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
      <div className="sticky top-14 z-30 -mx-4 mb-2 flex flex-wrap items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-12 lg:px-12">
        <Link href="/admin/thoughts" className="micro text-muted hover:text-accent-text">
          ← Thoughts
        </Link>
        <Badge solid={p.status === "published"}>{p.status}</Badge>
        {dirty && <span className="micro font-mono text-muted">• Unsaved</span>}
        <p role="status" aria-live="polite" className="micro font-mono">
          {pending ? "Saving…" : msg && (msg.ok ? msg.text : `✕ ${msg.text}`)}
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          {p.id && (
            <a href={`/preview/thought/${p.id}`} target="_blank" rel="noreferrer" className={btnGhost}>
              Preview <Arrow />
            </a>
          )}
          <button type="submit" disabled={pending} className={btnGhost}>
            Save
          </button>
          {p.status === "published" && (
            <button type="button" disabled={pending} onClick={() => save("draft")} className={btnGhost}>
              Unpublish
            </button>
          )}
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
          <Field label="URL slug *" hint={`/thoughts/${p.slug || "…"}`} className="sm:col-span-2">
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
          <Field label="Topic">
            <select value={p.topic} onChange={(e) => set("topic", e.target.value as PostTopic)} className={inputCls}>
              <option value="design">Design</option>
              <option value="data">Data</option>
              <option value="both">Design + Data</option>
            </select>
          </Field>
        </div>
        <Field label="Excerpt" hint="One or two sentences. Shown in the list and as the intro.">
          <textarea value={p.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Tags" hint="Comma separated">
          <input value={tags} onChange={(e) => (setTags(e.target.value), setDirty(true))} className={inputCls} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4" />
          Pin to the top of Thoughts
        </label>
      </Section>

      <Section n="02" title="Cover (optional)">
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
      </Section>

      <Section n="03" title="Writing">
        <p className="-mt-2 text-sm text-muted">
          Build the piece from blocks — text, headings, quotes, images, code and charts. Leave a blank line between paragraphs.
        </p>
        <BlockEditor
          blocks={blocks}
          discipline={p.topic === "data" ? "data" : "design"}
          altErrors={altErrors}
          onChange={(b) => {
            setBlocks(b);
            setDirty(true);
          }}
        />
      </Section>

      <Section n="04" title="Search (SEO)">
        <Field label="SEO title" hint="Defaults to the title">
          <input value={p.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} className={inputCls} />
        </Field>
        <Field label="SEO description" hint="Defaults to the excerpt. ~155 characters.">
          <textarea value={p.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} rows={2} maxLength={300} className={inputCls} />
        </Field>
      </Section>
    </form>
  );
}
