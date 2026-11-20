import { ogImage, ogSize } from "@/lib/og";
import { getProject, getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site-settings";

export const alt = "Data analysis case study";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getProjects("data")).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [p, site] = await Promise.all([getProject("data", (await params).slug), getSite()]);
  return ogImage({
    label: `Data — ${p?.category ?? "Case study"}`,
    title: p?.title ?? "Data",
    name: site.name,
    role: site.role,
  });
}
