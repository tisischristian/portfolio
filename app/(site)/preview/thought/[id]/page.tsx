import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostView } from "@/components/thoughts/post-view";
import { Arrow } from "@/components/ui/arrow";
import { getAdmin } from "@/lib/admin/auth";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

/** Admin-only preview of a Thought, including drafts. */
export default async function PreviewThought({ params }: Props) {
  const { id } = await params;
  const { sb, isAdmin } = await getAdmin();
  if (!isAdmin || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await sb.from("posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const post = data as Post;

  return (
    <div className="bg-bg text-fg">
      <div className="micro fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6">
        <div className="flex items-center gap-4 rounded-full bg-fg py-2 pr-2 pl-5 text-bg shadow-lg">
          <span className="font-mono">Preview · {post.status === "draft" ? "Draft — not public" : "Published"}</span>
          <Link href={`/admin/thoughts/${post.id}`} className="rounded-full border border-current px-3 py-1.5 hover:bg-bg hover:text-fg">
            <Arrow rotate={-135} /> Back to editor
          </Link>
        </div>
      </div>
      <PostView post={post} />
    </div>
  );
}
