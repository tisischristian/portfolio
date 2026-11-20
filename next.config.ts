import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Renamed pages keep their old links working.
  async redirects() {
    return [
      { source: "/about", destination: "/manifesto", permanent: true },
      { source: "/contact", destination: "/brief-me", permanent: true },
      { source: "/exhibits", destination: "/design", permanent: false },
      { source: "/blog", destination: "/thoughts", permanent: true },
      { source: "/scribbles/:path*", destination: "/thoughts/:path*", permanent: true },
      { source: "/scribbles", destination: "/thoughts", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
