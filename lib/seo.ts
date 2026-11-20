/** Public origin of the site, used for canonical URLs, the sitemap and share images. Set NEXT_PUBLIC_SITE_URL in production. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const absolute = (path: string) => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
