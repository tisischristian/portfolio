"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { editableKeys, type SiteConfig } from "@/lib/site";
import { MediaField } from "./media-field";
import { Field, btnGhost, btnPrimary, inputCls } from "./ui";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-10 lg:grid-cols-[220px_1fr]">
      <h2 className="micro font-mono text-muted">{`// ${n} — ${title}`}</h2>
      <div className="min-w-0 space-y-6">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: SiteConfig }) {
  const [s, setS] = useState(initial);
  const [raw, setRaw] = useState({
    bio: initial.bio.join("\n\n"),
    marquee: initial.marquee.join("\n"),
    skillsDesign: initial.skills.design.join("\n"),
    skillsData: initial.skills.data.join("\n"),
    experience: initial.experience.map((e) => `${e.years} | ${e.role} | ${e.org}`).join("\n"),
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) => setS((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value: SiteConfig = {
      ...s,
      bio: raw.bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      marquee: lines(raw.marquee),
      skills: { design: lines(raw.skillsDesign), data: lines(raw.skillsData) },
      experience: lines(raw.experience).map((l) => {
        const [years = "", role = "", org = ""] = l.split("|").map((x) => x.trim());
        return { years, role, org };
      }),
      socials: s.socials.filter((x) => x.label.trim() && x.href.trim()),
    };
    const payload = Object.fromEntries(editableKeys.map((k) => [k, value[k]]));
    start(async () => {
      const r = await saveSettings(payload);
      setMsg(r.ok ? "Saved — the public site updates within a few seconds." : `✕ ${r.error}`);
    });
  }

  return (
    <form onSubmit={submit}>
      <div className="sticky top-14 z-30 -mx-4 mb-2 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-12 lg:px-12">
        <p role="status" aria-live="polite" className="micro font-mono">
          {pending ? "Saving…" : msg}
        </p>
        <button type="submit" disabled={pending} className={`${btnPrimary} ml-auto`}>
          Save settings
        </button>
      </div>

      <Section n="01" title="Identity">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name *">
            <input value={s.name} required onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Monogram" hint="2–3 letters shown in the nav">
            <input value={s.monogram} onChange={(e) => set("monogram", e.target.value)} maxLength={6} className={inputCls} />
          </Field>
          <Field label="Role line">
            <input value={s.role} onChange={(e) => set("role", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Location" hint="Use a new line to break it in two">
            <textarea value={s.location} onChange={(e) => set("location", e.target.value)} rows={2} className={inputCls} />
          </Field>
          <Field label="Design tagline">
            <input value={s.taglineDesign} onChange={(e) => set("taglineDesign", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Data tagline">
            <input value={s.taglineData} onChange={(e) => set("taglineData", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={s.available} onChange={(e) => set("available", e.target.checked)} className="size-4" />
          Show &ldquo;Available for work&rdquo;
        </label>
      </Section>

      <Section n="02" title="Portrait & CV">
        <MediaField
          label="Hero portrait"
          url={s.portrait}
          withAlt={false}
          onChange={(v) => set("portrait", v.url)}
        />
        <p className="-mt-3 text-xs text-muted">
          Use a PNG with a transparent background (a cut-out) for the layered hero effect. The name is used as its alt text.
        </p>
        <MediaField label="CV (PDF)" kind="pdf" url={s.cvUrl} onChange={(v) => set("cvUrl", v.url)} />
      </Section>

      <Section n="03" title="Contact & social">
        <Field label="Contact email">
          <input type="email" value={s.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
        </Field>
        <div className="space-y-2">
          <span className="micro block font-mono text-muted">Social links</span>
          {s.socials.map((x, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={x.label}
                onChange={(e) => set("socials", s.socials.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))}
                placeholder="Behance"
                aria-label={`Link ${i + 1} label`}
                className={`${inputCls} w-36`}
              />
              <input
                type="url"
                value={x.href}
                onChange={(e) => set("socials", s.socials.map((y, j) => (j === i ? { ...y, href: e.target.value } : y)))}
                placeholder="https://"
                aria-label={`Link ${i + 1} URL`}
                className={inputCls}
              />
              <button type="button" onClick={() => set("socials", s.socials.filter((_, j) => j !== i))} aria-label={`Remove link ${i + 1}`} className="px-3 text-muted hover:text-fg">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set("socials", [...s.socials, { label: "", href: "" }])} className={btnGhost}>
            + Add link
          </button>
        </div>
      </Section>

      <Section n="04" title="About page">
        <Field label="Bio" hint="Blank line between paragraphs">
          <textarea value={raw.bio} onChange={(e) => setRaw({ ...raw, bio: e.target.value })} rows={7} className={inputCls} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Design skills" hint="One per line">
            <textarea value={raw.skillsDesign} onChange={(e) => setRaw({ ...raw, skillsDesign: e.target.value })} rows={9} className={inputCls} />
          </Field>
          <Field label="Data skills" hint="One per line">
            <textarea value={raw.skillsData} onChange={(e) => setRaw({ ...raw, skillsData: e.target.value })} rows={9} className={inputCls} />
          </Field>
        </div>
        <Field label="Experience" hint="One per line: years | role | organisation">
          <textarea value={raw.experience} onChange={(e) => setRaw({ ...raw, experience: e.target.value })} rows={5} className={`${inputCls} font-mono`} />
        </Field>
      </Section>

      <Section n="05" title="Home ticker">
        <Field label="Ticker phrases" hint="One per line — they scroll along the bottom of the hero">
          <textarea value={raw.marquee} onChange={(e) => setRaw({ ...raw, marquee: e.target.value })} rows={8} className={inputCls} />
        </Field>
      </Section>
    </form>
  );
}
