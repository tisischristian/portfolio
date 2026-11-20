import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignCaseStudyView } from "@/components/case-study/design-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getProject, getProjects, nextProject } from "@/lib/projects";
import { absolute } from "@/lib/seo";
import { getSite } from "@/lib/site-settings";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects("design")).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject("design", (await params).slug);
  if (!p) return {};
  return { title: p.seo_title ?? p.title, description: p.seo_description ?? p.summary ?? undefined };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = await getProject("design", slug);
  if (!p) notFound();
  const site = await getSite();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: p.title,
          description: p.summary ?? undefined,
          url: absolute(`/design/${p.slug}`),
          image: p.cover_url ?? undefined,
          dateCreated: p.year ? String(p.year) : undefined,
          genre: p.category ?? undefined,
          keywords: [...p.tags, ...(p.tools ?? [])].join(", ") || undefined,
          creator: { "@type": "Person", name: site.name },
        }}
      />
      <DesignCaseStudyView p={p} next={nextProject(await getProjects("design"), slug)} />
    </>
  );
}
