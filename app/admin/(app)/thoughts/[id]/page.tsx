import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm, type EditablePost } from "@/components/admin/post-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Edit thought" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditPost({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { sb } = await requireAdmin();
  const { data } = await sb.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { published_at, created_at, updated_at, ...initial } = data;

  return (
    <>
      <PageHeader label="02 — Thoughts" title={data.title} />
      <PostForm initial={initial as EditablePost} justSaved={saved} />
    </>
  );
}
