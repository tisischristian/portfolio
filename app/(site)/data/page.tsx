import type { Metadata } from "next";
import { ComingSoon } from "@/components/site/coming-soon";
import { DataIndex } from "@/components/site/data-index";
import { SectionLabel } from "@/components/ui/section-label";
import { categoriesOf, getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site-settings";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Data",
  description: "Data analysis, dashboards and visualisation projects.",
};

export default async function DataPage() {
  const [projects, site] = await Promise.all([getProjects("data"), getSite()]);
  return (
    <>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <div className="flex items-baseline justify-between gap-6">
          <SectionLabel>Data</SectionLabel>
          {projects.length > 0 && (
            <p className="micro font-mono text-muted">
              [{projects.length} {projects.length === 1 ? "project" : "projects"}]
            </p>
          )}
        </div>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-hero)]">
          Data
        </Reveal>
        <p className="mt-8 max-w-xl text-muted">
          {site.taglineData} Analysis, dashboards and visualisation — from question to decision.
        </p>
      </header>
      {projects.length > 0 ? (
        <DataIndex projects={projects} categories={categoriesOf(projects)} />
      ) : (
        <section className="container-x pb-28 lg:pb-40">
          <ComingSoon size="lg">
            Data analysis case studies — dashboards, SQL and Python work — will be published here soon.
          </ComingSoon>
        </section>
      )}
    </>
  );
}
