import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import type { MediaRow } from "@/lib/admin/upload";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { sb } = await requireAdmin();
  const [{ data: media }, { data: projects }, { data: settings }] = await Promise.all([
    sb.from("media").select("*").order("created_at", { ascending: false }),
    sb.from("projects").select("title, cover_url, report_url, blocks"),
    sb.from("settings").select("value"),
  ]);

  // Where is each file used? (cover, report, any block, or site settings)
  const usage: Record<string, string[]> = {};
  for (const m of (media ?? []) as MediaRow[]) {
    const where: string[] = [];
    for (const p of projects ?? []) {
      if (p.cover_url === m.url || p.report_url === m.url || JSON.stringify(p.blocks).includes(m.url)) where.push(p.title);
    }
    if ((settings ?? []).some((s) => JSON.stringify(s.value).includes(m.url))) where.push("Site settings");
    usage[m.id] = where;
  }

  return (
    <>
      <PageHeader label="02 — Media" title="Media library" />
      <MediaLibrary initial={(media ?? []) as MediaRow[]} usage={usage} />
    </>
  );
}
