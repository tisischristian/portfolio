import type { Metadata } from "next";
import { ProjectForm, type EditableProject } from "@/components/admin/project-form";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New project" };

type Props = { searchParams: Promise<{ discipline?: string }> };

export default async function NewProject({ searchParams }: Props) {
  const discipline = (await searchParams).discipline === "data" ? "data" : "design";
  const initial: EditableProject = {
    discipline,
    title: "",
    slug: "",
    summary: null,
    cover_url: null,
    cover_alt: null,
    year: new Date().getFullYear(),
    category: null,
    tags: [],
    featured: false,
    status: "draft",
    client: null,
    role: null,
    deliverables: null,
    palette: discipline === "design" ? [] : null,
    fonts: null,
    question: null,
    dataset_source: null,
    dataset_size: null,
    tools: null,
    metrics: discipline === "data" ? [{ label: "", value: "" }] : [],
    embed_url: null,
    github_url: null,
    notebook_url: null,
    report_url: null,
    blocks: [],
    seo_title: null,
    seo_description: null,
  };

  return (
    <>
      <PageHeader label="01 — Projects" title={discipline === "design" ? "New design project" : "New data project"} />
      <ProjectForm initial={initial} />
    </>
  );
}
