import type { Project } from "./types";

/**
 * Placeholder projects shown only while Supabase has no published projects.
 * They demonstrate every layout; delete nothing — they disappear automatically
 * once you publish your first real project from /admin.
 */
const base: Omit<Project, "id" | "discipline" | "title" | "slug"> = {
  summary: null,
  cover_url: null,
  cover_alt: null,
  year: 2026,
  category: null,
  tags: [],
  featured: false,
  sort_order: 0,
  status: "published",
  client: null,
  role: null,
  deliverables: null,
  palette: null,
  fonts: null,
  question: null,
  dataset_source: null,
  dataset_size: null,
  tools: null,
  metrics: [],
  embed_url: null,
  github_url: null,
  notebook_url: null,
  report_url: null,
  blocks: [],
  seo_title: null,
  seo_description: null,
  published_at: null,
};

const s = (p: Partial<Project> & Pick<Project, "discipline" | "title" | "slug">): Project => ({
  ...base,
  id: `sample-${p.slug}`,
  ...p,
});

export const samples: Project[] = [
  // ───────── DESIGN ─────────
  s({
    discipline: "design",
    title: "Northfield Coffee",
    slug: "northfield-coffee",
    category: "Visual Identity",
    client: "Northfield Roasters",
    role: "Identity design, art direction",
    deliverables: ["Logo system", "Packaging", "Signage", "Guidelines"],
    palette: ["#1B1A17", "#E9E2D3", "#B0472E", "#7A8B6F"],
    fonts: ["Archivo Expanded", "Inter"],
    featured: true,
    sort_order: 1,
    summary:
      "A warm, confident identity for a small-batch roaster: a circular stamp mark built from the roast curve, set against a restrained earthy palette.",
    blocks: [
      { type: "heading", text: "The mark" },
      {
        type: "text",
        text: "The roast profile — temperature over time — became the curve inside the stamp. It works as a seal on bags, a stencil on crates and a favicon.\n\nEvery application uses the same three-part lockup so the system stays recognisable at any size.",
      },
      { type: "full-image", alt: "Packaging range on a shelf" },
      { type: "image-grid", columns: 2, images: [{ alt: "Cup sleeve" }, { alt: "Shop signage" }] },
      { type: "quote", text: "It finally looks like the coffee tastes.", cite: "Founder, Northfield" },
      { type: "image-grid", columns: 3, images: [{ alt: "Stamp detail" }, { alt: "Tote bag" }, { alt: "Menu board" }] },
    ],
  }),
  s({
    discipline: "design",
    title: "Halden Poster Series",
    slug: "halden-poster-series",
    category: "Graphic Design",
    client: "Halden Arts Festival",
    role: "Poster design",
    deliverables: ["12 posters", "Social kit"],
    palette: ["#060606", "#F4F1EA", "#D9452B"],
    fonts: ["Instrument Serif", "JetBrains Mono"],
    featured: true,
    sort_order: 2,
    summary: "Twelve typographic posters for a music and film festival, each built on the same 6-column grid.",
    blocks: [
      { type: "text", text: "One grid, twelve personalities. Type size, not colour, carries the hierarchy." },
      { type: "image-grid", columns: 3, images: [{ alt: "Poster 01" }, { alt: "Poster 02" }, { alt: "Poster 03" }] },
      { type: "full-image", alt: "Posters installed in the street" },
    ],
  }),
  s({
    discipline: "design",
    title: "Okra Studio",
    slug: "okra-studio",
    category: "Packaging",
    client: "Okra Studio",
    role: "Packaging design",
    deliverables: ["Packaging", "Labels"],
    palette: ["#2F3B2A", "#F0EBDD", "#C9A44C"],
    fonts: ["Archivo", "Inter"],
    featured: true,
    sort_order: 3,
    summary: "Label system for a natural skincare line — a modular band that flexes across 14 product sizes.",
    blocks: [{ type: "full-image", alt: "Product line-up" }],
  }),
  s({
    discipline: "design",
    title: "Atlas Quarterly",
    slug: "atlas-quarterly",
    category: "Editorial",
    client: "Atlas Magazine",
    role: "Editorial design",
    deliverables: ["Masthead", "Layout system", "Covers"],
    palette: ["#0E0E0E", "#FFFFFF"],
    fonts: ["Instrument Serif", "Inter"],
    featured: true,
    sort_order: 4,
    summary: "Masthead and layout system for an independent travel quarterly.",
    blocks: [{ type: "image-grid", columns: 2, images: [{ alt: "Cover" }, { alt: "Spread" }] }],
  }),
  s({
    discipline: "design",
    title: "Kora Type Specimen",
    slug: "kora-type-specimen",
    category: "Typography",
    client: "Self-initiated",
    role: "Type & layout",
    sort_order: 5,
    year: 2025,
    summary: "A printed specimen for a display typeface in progress.",
  }),
  // No data samples: the Data section shows "Coming soon" until a real data project is published.
];
