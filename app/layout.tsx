import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/seo";
import { getSite } from "@/lib/site-settings";
import "./globals.css";

/** Copy, UI and labels. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Headers. BBH Bogle (Google Fonts, OFL) — self-hosted because next/font/google doesn't list it yet. */
const bogle = localFont({
  variable: "--font-bogle",
  src: "./fonts/BBHBogle-Regular.woff2",
  weight: "400",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const description = `${site.role}. Visual identity and graphic design portfolio${site.location ? ` — ${site.location.replace(/\n/g, " ")}` : ""}.`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
    description,
    applicationName: site.name,
    authors: [{ name: site.name }],
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${site.name} — ${site.role}`,
      description,
      locale: "en",
    },
    twitter: { card: "summary_large_image", title: `${site.name} — ${site.role}`, description },
    robots: { index: true, follow: true },
  };
}

const bootScript = `(function(){try{var d=document.documentElement,c=d.classList;c.add('js');
var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)c.add('reduce');
var p=location.pathname,site=!/^\\/(admin|preview)/.test(p),seen=false;
try{seen=sessionStorage.getItem('pf-seen')==='1'}catch(e){}
if(site&&!r&&!seen)c.add('pf-loading');}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: "#060606",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexMono.variable} ${bogle.variable}`} suppressHydrationWarning>
      <head>
        {/* Before paint: flag JS + reduced motion, and decide whether the first-visit loader shows. */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
