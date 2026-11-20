import type { Metadata } from "next";
import { PostForm, type EditablePost } from "@/components/admin/post-form";
import { PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New thought" };

export default function NewPost() {
  const initial: EditablePost = {
    title: "",
    slug: "",
    excerpt: null,
    cover_url: null,
    cover_alt: null,
    topic: "design",
    tags: [],
    blocks: [{ type: "text", text: "" }],
    status: "draft",
    featured: false,
    seo_title: null,
    seo_description: null,
  };
  return (
    <>
      <PageHeader label="02 — Thoughts" title="New thought" />
      <PostForm initial={initial} />
    </>
  );
}
