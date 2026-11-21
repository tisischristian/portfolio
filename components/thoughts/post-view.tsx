import Link from "next/link";
import { Blocks } from "@/components/blocks/blocks";
import { Reveal } from "@/components/motion/reveal";
import { Cover } from "@/components/site/cover";
import { Arrow, ArrowCircle } from "@/components/ui/arrow";
import { SectionLabel } from "@/components/ui/section-label";
import { formatDate, readingMinutes, topicLabel } from "@/lib/posts";
import type { Post } from "@/lib/types";

/** A single Thought. Shared by the public page and the admin draft preview. */
export function PostView({ post, newer, older }: { post: Post; newer?: Post | null; older?: Post | null }) {
  const minutes = readingMinutes(post.blocks, post.excerpt);
  return (
    <article>
      <header className="container-x pt-36 pb-12 sm:pt-44">
        <SectionLabel>
          <Link href="/thoughts" className="hover:underline">
            Thoughts
          </Link>{" "}
          — {topicLabel[post.topic]}
        </SectionLabel>
        <Reveal as="h1" className="display mt-6 max-w-5xl text-[length:var(--fs-h1)]">
          {post.title}
        </Reveal>
        <dl className="micro mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
          <div>
            <dt className="mb-1 font-mono text-muted">[Published]</dt>
            <dd>
              <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
            </dd>
          </div>
          <div>
            <dt className="mb-1 font-mono text-muted">[Reading time]</dt>
            <dd>{minutes} min</dd>
          </div>
          {post.tags.length > 0 && (
            <div>
              <dt className="mb-1 font-mono text-muted">[Tags]</dt>
              <dd>{post.tags.join(" · ")}</dd>
            </div>
          )}
        </dl>
      </header>

      {post.excerpt && (
        <section className="container-x pb-16 lg:pb-24">
          <Reveal as="p" className="max-w-4xl text-[length:var(--fs-h2)] leading-[1.2] font-medium tracking-tight lg:ml-[calc(100%/12*4)]">
            {post.excerpt}
          </Reveal>
        </section>
      )}

      {post.cover_url && (
        <Cover
          src={post.cover_url}
          alt={post.cover_alt ?? post.title}
          seed={post.slug}
          discipline="design"
          className="mb-16 aspect-[16/9] lg:mb-24"
          sizes="100vw"
          priority
          reveal={false}
        />
      )}

      <Blocks blocks={post.blocks} slug={post.slug} discipline={post.topic === "data" ? "data" : "design"} />

      {(newer || older) && (
        <nav aria-label="More thoughts" className="container-x mt-28 grid gap-px border-t border-line pt-10 sm:grid-cols-2 lg:mt-40">
          {older ? (
            <Link href={`/thoughts/${older.slug}`} data-cursor="Read" className="group block py-4">
              <span className="micro font-mono text-muted">{"// Previous"}</span>
              <span className="display mt-3 flex items-start gap-3 text-[clamp(1.5rem,3vw,2.5rem)]">
                <ArrowCircle rotate={180} className="size-[0.8em] shrink-0 transition-transform duration-500 group-hover:-translate-x-1" />
                {older.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link href={`/thoughts/${newer.slug}`} data-cursor="Read" className="group block py-4 sm:text-right">
              <span className="micro font-mono text-muted">{"// Next"}</span>
              <span className="display mt-3 flex items-start gap-3 text-[clamp(1.5rem,3vw,2.5rem)] sm:justify-end">
                {newer.title}
                <ArrowCircle className="size-[0.8em] shrink-0 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </Link>
          )}
        </nav>
      )}

      <div className="container-x mt-16">
        <Link href="/thoughts" className="micro inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 transition-colors hover:border-accent hover:bg-accent hover:text-ink">
          All thoughts <Arrow />
        </Link>
      </div>
    </article>
  );
}
