import { ogImage, ogSize } from "@/lib/og";
import { getPost, getPosts, topicLabel } from "@/lib/posts";
import { getSite } from "@/lib/site-settings";

export const alt = "Thought — notes on design and data";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [p, site] = await Promise.all([getPost((await params).slug), getSite()]);
  return ogImage({
    label: `Thoughts — ${p ? topicLabel[p.topic] : "Notes"}`,
    title: p?.title ?? "Thoughts",
    name: site.name,
    role: site.role,
  });
}
