"use client";

import { usePathname } from "next/navigation";
import { Cursor } from "@/components/motion/cursor";
import { Loader } from "@/components/motion/loader";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import type { Discipline, SiteConfig } from "@/lib/site";
import { Footer } from "./footer";
import { Nav } from "./nav";
import { SiteProvider } from "./site-context";

export function Shell({ site, children }: { site: SiteConfig; children: React.ReactNode }) {
  const pathname = usePathname();
  const discipline: Discipline | null = pathname.startsWith("/data")
    ? "data"
    : pathname.startsWith("/design")
      ? "design"
      : null;

  return (
    <SiteProvider site={site}>
      <div data-discipline={discipline ?? "home"} className="min-h-svh bg-bg text-fg">
        <a href="#main" className="skip-link micro">
          Skip to content
        </a>
        <Nav discipline={discipline} />
        <main id="main">{children}</main>
        <Footer />
      </div>
      <MotionProvider />
      <PageTransition />
      <Loader monogram={site.monogram} />
      <Cursor />
    </SiteProvider>
  );
}
