import type { Metadata } from "next";
import Link from "next/link";
import { ProjectList } from "@/components/admin/project-list";
import { PageHeader, btnGhost, btnPrimary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { sb } = await requireAdmin();
  const { data } = await sb
    .from("projects")
    .select("id, title, slug, discipline, status, featured, category, year, cover_url, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  return (
    <>
      <PageHeader label="01 — Projects" title="Projects">
        <Link href="/admin/projects/new?discipline=design" className={btnPrimary}>
          + Design
        </Link>
        <Link href="/admin/projects/new?discipline=data" className={btnGhost}>
          + Data
        </Link>
      </PageHeader>
      <ProjectList projects={data ?? []} />
    </>
  );
}
