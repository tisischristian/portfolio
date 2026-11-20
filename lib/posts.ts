import { cache } from "react";
import { publicClient } from "./supabase/public";
import type { Block, Post, PostTopic } from "./types";

/** Published Thoughts, newest first. */
export const getPosts = cache(async (): Promise<Post[]> => {
  const sb = publicClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[posts]", error.message);
    return [];
  }
  return (data ?? []) as Post[];
});

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

/** Older / newer neighbours for the bottom-of-post navigation. */
export async function neighbours(slug: string) {
  const list = await getPosts();
  const i = list.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? list[i - 1] : null, older: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

export const topicLabel: Record<PostTopic, string> = { design: "Design", data: "Data", both: "Design + Data" };

/** ~220 words per minute over all text-bearing blocks. */
export function readingMinutes(blocks: Block[], excerpt?: string | null) {
  let words = (excerpt ?? "").split(/\s+/).filter(Boolean).length;
  for (const b of blocks) {
    const text =
      b.type === "text" || b.type === "heading" || b.type === "quote"
        ? b.text
        : b.type === "code"
          ? b.code
          : b.type === "image" || b.type === "full-image"
            ? (b.caption ?? "")
            : "";
    words += text.split(/\s+/).filter(Boolean).length;
  }
  return Math.max(1, Math.round(words / 220));
}

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Draft";
