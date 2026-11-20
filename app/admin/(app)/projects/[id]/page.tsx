import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm, type EditableProject } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Edit project" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditProject({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { sb } = await requireAdmin();
  const { data } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sort_order, published_at, created_at, updated_at, ...initial } = data;

  return (
    <>
      <PageHeader label="01 — Projects" title={data.title} />
      <ProjectForm initial={initial as EditableProject} justSaved={saved} />
    </>
  );
}
