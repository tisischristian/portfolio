import type { ThoughtRow } from "@/components/thoughts/thought-list";
import { formatDate, readingMinutes, topicLabel } from "./posts";
import type { Post } from "./types";

/** Serializable list rows (pinned first, then newest). */
export function toRows(posts: Post[]): ThoughtRow[] {
  return [...posts]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      topic: p.topic,
      topicLabel: topicLabel[p.topic],
      date: formatDate(p.published_at),
      minutes: readingMinutes(p.blocks, p.excerpt),
      cover_url: p.cover_url,
      featured: p.featured,
    }));
}
