import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { ThoughtList } from "@/components/thoughts/thought-list";
import { ComingSoon } from "@/components/site/coming-soon";
import { SectionLabel } from "@/components/ui/section-label";
import { getPosts } from "@/lib/posts";
import { toRows } from "@/lib/thought-rows";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Thoughts",
  description: "Thoughts and ideas on design and data.",
};

export default async function ThoughtsPage() {
  const posts = await getPosts();
  return (
    <>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <div className="flex items-baseline justify-between gap-6">
          <SectionLabel>Thoughts</SectionLabel>
          {posts.length > 0 && (
            <p className="micro font-mono text-muted">
              [{posts.length} {posts.length === 1 ? "entry" : "entries"}]
            </p>
          )}
        </div>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-hero)]">
          Thoughts
        </Reveal>
        <p className="mt-8 max-w-xl text-muted">
          Notes, opinions and half-finished ideas on design and data — written in the margins between projects.
        </p>
      </header>
      <section className="container-x pb-28 lg:pb-40">
        {posts.length > 0 ? (
          <ThoughtList rows={toRows(posts)} />
        ) : (
          <ComingSoon size="lg" label="Thoughts">
            The first notes on design and data are being written. Check back soon.
          </ComingSoon>
        )}
      </section>
    </>
  );
}
