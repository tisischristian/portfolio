import Link from "next/link";
import { Shell } from "@/components/site/shell";
import { getSite } from "@/lib/site-settings";

export default async function NotFound() {
  return (
    <Shell site={await getSite()}>
      <section className="container-x flex min-h-[80svh] flex-col justify-end pt-36 pb-16">
        <p className="micro font-mono text-muted">{"// Error 404"}</p>
        <h1 className="display mt-6 text-[length:var(--fs-hero)]">Lost</h1>
        <p className="mt-8 max-w-md text-muted">This page doesn&rsquo;t exist, or it has moved.</p>
        <div className="mt-10 flex gap-3">
          <Link href="/design" className="micro inline-flex h-11 items-center rounded-full border border-line-strong px-5 hover:bg-fg hover:text-bg">
            Design work
          </Link>
          <Link href="/data" className="micro inline-flex h-11 items-center rounded-full border border-line-strong px-5 hover:bg-fg hover:text-bg">
            Data work
          </Link>
        </div>
      </section>
    </Shell>
  );
}
