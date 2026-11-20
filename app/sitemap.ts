import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";
import { absolute } from "@/lib/seo";
import { isSample } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [design, data] = await Promise.all([getProjects("design"), getProjects("data")]);
  const pages: MetadataRoute.Sitemap = [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/design"), changeFrequency: "weekly", priority: 0.9 },
    { url: absolute("/data"), changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absolute("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];
  // Real projects only — sample placeholders are not worth indexing.
  const projects = [...design, ...data]
    .filter((p) => !isSample(p))
    .map((p) => ({
      url: absolute(`/${p.discipline}/${p.slug}`),
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  return [...pages, ...projects];
}
