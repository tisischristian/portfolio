import Link from "next/link";
import { Hero } from "@/components/site/hero";
import { Brands } from "@/components/site/brands";
import { ComingSoon } from "@/components/site/coming-soon";
import { DataCard, DesignCard } from "@/components/site/project-cards";
import { Services } from "@/components/site/services";
import { SplitEntry } from "@/components/site/split-entry";
import { SectionLabel } from "@/components/ui/section-label";
import { ThoughtList } from "@/components/thoughts/thought-list";
import { getPosts } from "@/lib/posts";
import { getFeatured } from "@/lib/projects";
import { toRows } from "@/lib/thought-rows";
import { Reveal } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";
import { JsonLd } from "@/components/seo/json-ld";
import { siteUrl } from "@/lib/seo";
import { getSite } from "@/lib/site-settings";

export const revalidate = 60;

/** Text wrapped in *asterisks* is shown in full white; the rest stays grey. */
function highlight(text: string) {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 ? (
      <span key={i} className="text-fg">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// Editorial rhythm for the featured design grid (12-col on desktop).
const layout = [
  { col: "lg:col-span-7", aspect: "aspect-[4/3]" },
  { col: "lg:col-span-4 lg:col-start-9 lg:mt-40", aspect: "aspect-[4/5]" },
  { col: "lg:col-span-4 lg:col-start-2", aspect: "aspect-[4/5]" },
  { col: "lg:col-span-6 lg:col-start-7 lg:mt-24", aspect: "aspect-[4/3]" },
];

export default async function Home() {
  const [design, data, site, posts] = await Promise.all([getFeatured("design", 4), getFeatured("data", 3), getSite(), getPosts()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: site.role,
          url: siteUrl,
          image: site.portrait ?? undefined,
          address: site.location ? { "@type": "PostalAddress", addressLocality: site.location.split(/\n/)[0].replace(/^Based in /i, "").replace(/,$/, "") } : undefined,
          sameAs: site.socials.map((s) => s.href).filter((h) => /^https?:\/\//.test(h)),
          knowsAbout: ["Visual identity", "Graphic design", "Typography", "Data analysis"],
        }}
      />
      <Hero />
      <SplitEntry design={design[0]} data={data[0]} />

      <section className="container-x py-28 lg:py-40">
        <SectionLabel index="01">Intro</SectionLabel>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Reveal
            as="p"
            className="text-[length:var(--fs-h2)] leading-[1.1] font-medium tracking-tight text-muted lg:col-span-10"
          >
            {highlight(site.introStatement)}
          </Reveal>
          <div className="lg:col-span-5 lg:col-start-6">
            <p className="max-w-md text-sm text-muted">{site.introBody}</p>
            <Link
              href="/manifesto"
              data-magnetic
              className="micro mt-8 inline-flex h-11 items-center rounded-full border border-line-strong px-5 transition-colors hover:bg-fg hover:text-bg"
            >
              More about me
            </Link>
          </div>
        </div>
      </section>

      <Brands index="02" />

      {/* Featured design */}
      <section className="py-28 lg:py-40">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <div>
              <SectionLabel index="03">Selected design</SectionLabel>
              <Reveal as="h2" className="display mt-4 text-[length:var(--fs-h1)]">
                Design
              </Reveal>
            </div>
            <Link href="/design" className="micro shrink-0 underline-offset-4 hover:underline">
              All design exhibits <Arrow />
            </Link>
          </div>
          <div className="mt-16 grid gap-x-[var(--gutter)] gap-y-16 sm:grid-cols-2 lg:grid-cols-12">
            {design.map((p, i) => (
              <Reveal key={p.id} mode="fade" delay={(i % 2) * 0.1} className={layout[i % layout.length].col}>
                <DesignCard p={p} aspect={layout[i % layout.length].aspect} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured data — "Coming soon" until the first data project is published */}
      <section className="py-28 lg:py-40">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <div>
              <SectionLabel index="04">Selected data</SectionLabel>
              <Reveal as="h2" className="display mt-4 text-[length:var(--fs-h1)]">
                Data
              </Reveal>
            </div>
            {data.length > 0 && (
              <Link href="/data" className="micro shrink-0 underline-offset-4 hover:underline">
                All data exhibits <Arrow />
              </Link>
            )}
          </div>
          {data.length > 0 ? (
            <div className="mt-16 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p, i) => (
                <Reveal key={p.id} mode="fade" delay={i * 0.08}>
                  <DataCard p={p} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
                </Reveal>
              ))}
            </div>
          ) : (
            <ComingSoon className="mt-16">Data analysis projects are on the way.</ComingSoon>
          )}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-x py-28 lg:py-40">
          <div className="flex items-end justify-between gap-6">
            <div>
              <SectionLabel index="05">Latest thoughts</SectionLabel>
              <Reveal as="h2" className="display mt-4 text-[length:var(--fs-h1)]">
                Thoughts
              </Reveal>
            </div>
            <Link href="/thoughts" className="micro shrink-0 underline-offset-4 hover:underline">
              All thoughts <Arrow />
            </Link>
          </div>
          <div className="mt-12">
            <ThoughtList rows={toRows(posts).slice(0, 3)} compact />
          </div>
        </section>
      )}

      <Services index={posts.length > 0 ? "06" : "05"} />
    </>
  );
}
