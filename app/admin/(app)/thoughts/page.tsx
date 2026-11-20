import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/admin/post-list";
import { PageHeader, btnPrimary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Thoughts" };

export default async function ThoughtsPage() {
  const { sb } = await requireAdmin();
  const { data } = await sb
    .from("posts")
    .select("id, title, slug, topic, status, featured, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <PageHeader label="02 — Thoughts" title="Thoughts">
        <Link href="/admin/thoughts/new" className={btnPrimary}>
          + New thought
        </Link>
      </PageHeader>
      <PostList posts={data ?? []} />
    </>
  );
}
