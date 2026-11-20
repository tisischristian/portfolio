import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComingSoon } from "@/components/site/coming-soon";
import { Cover } from "@/components/site/cover";
import { getProjects } from "@/lib/projects";
import { SectionLabel } from "@/components/ui/section-label";
import { getSite } from "@/lib/site-settings";
import { Reveal } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: "About", description: `About ${site.name} — ${site.role}.` };
}

export default async function About() {
  const [site, dataProjects] = await Promise.all([getSite(), getProjects("data")]);
  const dataReady = dataProjects.length > 0;
  return (
    <>
      <header className="container-x pt-36 pb-16 sm:pt-44">
        <SectionLabel>About</SectionLabel>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-hero)]">About</Reveal>
      </header>

      <section className="container-x grid gap-12 pb-28 lg:grid-cols-12 lg:pb-40">
        <div className="lg:col-span-5">
          {site.portrait ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-line">
              <Image src={site.portrait} alt={site.name} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover grayscale" />
            </div>
          ) : (
            <Cover alt="Portrait placeholder" seed="portrait" discipline="design" className="aspect-[4/5]" reveal={false} />
          )}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="text-[length:var(--fs-h2)] leading-[1.15] font-medium tracking-tight">
            {site.role}. <span className="text-muted">{site.location.replace("\n", " ")}.</span>
          </p>
          <div className="mt-10 space-y-5 text-muted">
            {site.bio.map((b, i) => (
              <p key={i}>{b}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {site.cvUrl && (
              <a
                href={site.cvUrl}
                download
                className="micro inline-flex h-11 items-center rounded-full bg-fg px-5 text-bg transition-opacity hover:opacity-80"
              >
                Download CV <Arrow rotate={135} />
              </a>
            )}
            <Link
              href="/contact"
              className="micro inline-flex h-11 items-center rounded-full border border-line-strong px-5 transition-colors hover:bg-fg hover:text-bg"
            >
              Get in touch <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x py-28 lg:py-40">
        <SectionLabel index="01">Tools & skills</SectionLabel>
        <div className="mt-12 grid gap-16 sm:grid-cols-2">
          {(
            [
              ["Design", site.skills.design, true],
              ["Data", site.skills.data, dataReady],
            ] as const
          ).map(([title, items, ready]) => (
            <div key={title}>
              <h2 className="display text-[length:var(--fs-h2)]">{title}</h2>
              {ready ? (
                <ul className="mt-8 border-t border-line">
                  {items.map((s, i) => (
                    <li key={s} className="flex justify-between border-b border-line py-3.5">
                      {s}
                      <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ComingSoon className="mt-8" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-28 lg:py-40">
        <SectionLabel index="02">Experience</SectionLabel>
        <ol className="mt-12 border-t border-line">
          {site.experience.map((e, i) => (
            <li key={i} className="grid gap-2 border-b border-line py-6 sm:grid-cols-12 sm:items-baseline">
              <span className="font-mono text-sm text-muted sm:col-span-3">{e.years}</span>
              <span className="text-xl font-medium tracking-tight sm:col-span-6">{e.role}</span>
              <span className="text-muted sm:col-span-3 sm:text-right">{e.org}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
