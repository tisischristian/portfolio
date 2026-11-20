import { cache } from "react";
import type { Discipline } from "./site";
import { samples } from "./samples";
import { publicClient } from "./supabase/public";
import type { Project } from "./types";

async function fetchPublished(): Promise<Project[]> {
  const sb = publicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[projects]", error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

const fetchPublishedCached = cache(fetchPublished);

/**
 * Published projects for one discipline. Until the first real project of that discipline
 * is published, its bundled sample projects are shown (tagged [SAMPLE]) so the layout can be judged.
 */
export async function getProjects(discipline: Discipline) {
  const live = (await fetchPublishedCached()).filter((p) => p.discipline === discipline);
  return live.length ? live : samples.filter((p) => p.discipline === discipline);
}

export async function getProject(discipline: Discipline, slug: string) {
  return (await getProjects(discipline)).find((p) => p.slug === slug) ?? null;
}

export async function getFeatured(discipline: Discipline, n: number) {
  const list = await getProjects(discipline);
  const featured = list.filter((p) => p.featured);
  return (featured.length ? featured : list).slice(0, n);
}

export function nextProject(list: Project[], slug: string) {
  if (list.length < 2) return null;
  const i = list.findIndex((p) => p.slug === slug);
  return list[(i + 1) % list.length];
}

export function categoriesOf(list: Project[]) {
  return Array.from(new Set(list.map((p) => p.category).filter(Boolean))) as string[];
}
