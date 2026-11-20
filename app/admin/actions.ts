"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { SETTINGS_KEY, pickEditable } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/** Public pages are statically cached — refresh them after any content change. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// ───────── Auth ─────────

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

// ───────── Projects ─────────

const str = z.string().trim().nullish().transform((v) => (v ? v : null));
const strList = z.array(z.string().trim().min(1)).nullish().transform((v) => (v?.length ? v : null));

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  discipline: z.enum(["design", "data"]),
  title: z.string().trim().min(1, "Title is required").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only use lowercase letters, numbers and dashes"),
  summary: str,
  cover_url: str,
  cover_alt: str,
  year: z.number().int().min(1900).max(2100).nullish().transform((v) => v ?? null),
  category: str,
  tags: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
  client: str,
  role: str,
  deliverables: strList,
  palette: strList,
  fonts: strList,
  question: str,
  dataset_source: str,
  dataset_size: str,
  tools: strList,
  metrics: z.array(z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) })).default([]),
  embed_url: str,
  github_url: str,
  notebook_url: str,
  report_url: str,
  blocks: z.array(z.record(z.string(), z.unknown()).and(z.object({ type: z.string() }))).default([]),
  seo_title: str,
  seo_description: str,
});

export type ProjectInput = z.input<typeof projectSchema>;

export async function saveProject(input: ProjectInput): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid project" };

  const { id, ...row } = parsed.data;
  if (row.cover_url && !row.cover_alt) return { ok: false, error: "The cover image needs alt text." };

  let result;
  if (id) {
    result = await sb.from("projects").update(row).eq("id", id).select("id").single();
  } else {
    // New projects go to the end of their discipline's list.
    const { data: last } = await sb
      .from("projects")
      .select("sort_order")
      .eq("discipline", row.discipline)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    result = await sb
      .from("projects")
      .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
  }

  if (result.error) {
    if (result.error.code === "23505") return { ok: false, error: "Another project already uses this slug." };
    return { ok: false, error: result.error.message };
  }
  refreshSite();
  return { ok: true, id: result.data.id };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}

export async function setProjectFlags(
  id: string,
  flags: { featured?: boolean; status?: "draft" | "published" },
): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("projects").update(flags).eq("id", id);
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const results = await Promise.all(
    ids.map((id, i) => sb.from("projects").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  refreshSite();
  return { ok: true };
}

// ───────── Media ─────────

export async function deleteMedia(id: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { data: m, error } = await sb.from("media").select("path").eq("id", id).single();
  if (error) return { ok: false, error: error.message };
  const rm = await sb.storage.from("public-media").remove([m.path]);
  if (rm.error) return { ok: false, error: rm.error.message };
  const del = await sb.from("media").delete().eq("id", id);
  if (del.error) return { ok: false, error: del.error.message };
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const { error } = await sb.from("media").update({ alt: alt.trim() || null }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ───────── Messages ─────────

export async function updateMessage(id: string, patch: { read?: boolean; archived?: boolean }) {
  const { sb } = await requireAdmin();
  await sb.from("messages").update(patch).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string) {
  const { sb } = await requireAdmin();
  await sb.from("messages").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

// ───────── Settings ─────────

export async function saveSettings(value: Record<string, unknown>): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const clean = pickEditable(value);
  if (!clean.name?.trim()) return { ok: false, error: "Name is required." };
  if (clean.email && !z.string().email().safeParse(clean.email).success) {
    return { ok: false, error: "Contact email doesn't look valid." };
  }
  const { error } = await sb.from("settings").upsert({ key: SETTINGS_KEY, value: clean });
  if (error) return { ok: false, error: error.message };
  refreshSite();
  return { ok: true };
}
