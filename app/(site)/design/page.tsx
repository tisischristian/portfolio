import type { Metadata } from "next";
import { DesignIndex } from "@/components/site/design-index";
import { SectionLabel } from "@/components/ui/section-label";
import { categoriesOf, getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site-settings";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Design",
  description: "Visual identity, graphic design, packaging and typography projects.",
};

export default async function DesignPage() {
  const [projects, site] = await Promise.all([getProjects("design"), getSite()]);
  return (
    <>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <div className="flex items-baseline justify-between gap-6">
          <SectionLabel>Design</SectionLabel>
          <p className="micro font-mono text-muted">[{projects.length} {projects.length === 1 ? "project" : "projects"}]</p>
        </div>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-hero)]">
          Design
        </Reveal>
        <p className="mt-8 max-w-xl text-muted">
          {site.taglineDesign} Visual identity, graphic design, packaging and typography.
        </p>
      </header>
      <DesignIndex projects={projects} categories={categoriesOf(projects)} />
    </>
  );
}
