import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/thoughts/post-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getPost, getPosts, neighbours } from "@/lib/posts";
import { absolute } from "@/lib/seo";
import { getSite } from "@/lib/site-settings";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.seo_title ?? p.title,
    description: p.seo_description ?? p.excerpt ?? undefined,
    openGraph: { type: "article", publishedTime: p.published_at ?? undefined, tags: p.tags },
  };
}

export default async function ThoughtPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const [{ newer, older }, site] = await Promise.all([neighbours(slug), getSite()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          url: absolute(`/thoughts/${post.slug}`),
          image: post.cover_url ?? undefined,
          datePublished: post.published_at ?? undefined,
          dateModified: post.updated_at,
          keywords: post.tags.join(", ") || undefined,
          author: { "@type": "Person", name: site.name },
        }}
      />
      <PostView post={post} newer={newer} older={older} />
    </>
  );
}
