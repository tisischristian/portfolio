import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataCaseStudyView } from "@/components/case-study/data-view";
import { DesignCaseStudyView } from "@/components/case-study/design-view";
import { getAdmin } from "@/lib/admin/auth";
import type { Project } from "@/lib/types";
import { Arrow } from "@/components/ui/arrow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

/** Admin-only preview of any project, including drafts (RLS lets the admin read them). */
export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const { sb, isAdmin } = await getAdmin();
  if (!isAdmin || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Project;

  return (
    <div className="bg-bg text-fg">
      <div className="micro fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6">
        <div className="flex items-center gap-4 rounded-full bg-fg py-2 pr-2 pl-5 text-bg shadow-lg">
          <span className="font-mono">
            Preview · {p.status === "draft" ? "Draft — not public" : "Published"}
          </span>
          <Link href={`/admin/projects/${p.id}`} className="rounded-full border border-current px-3 py-1.5 hover:bg-bg hover:text-fg">
            <Arrow rotate={-135} /> Back to editor
          </Link>
        </div>
      </div>
      {p.discipline === "data" ? <DataCaseStudyView p={p} next={null} /> : <DesignCaseStudyView p={p} next={null} />}
    </div>
  );
}
