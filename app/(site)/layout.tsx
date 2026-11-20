import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Shell } from "@/components/site/shell";
import { getSite } from "@/lib/site-settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Shell site={await getSite()}>{children}</Shell>
      {/* Cookie-free, privacy-friendly page views + real-user Core Web Vitals. Active once deployed on Vercel
          (enable both in the Vercel project dashboard); they do nothing locally. Admin pages are not tracked. */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
