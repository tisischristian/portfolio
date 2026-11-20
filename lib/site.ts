/**
 * Default site-wide content. Most fields are editable in /admin/settings — saved values
 * (settings table, key "site") override these. Services stay code-only.
 */
const base = {
  name: "{{NAME}}",
  monogram: "{{MONOGRAM}}",
  role: "Visual Designer & Data Analyst",
  location: "Based in {{LOCATION}},\navailable worldwide",
  taglineDesign: "{{TAGLINE_DESIGN}}",
  taglineData: "{{TAGLINE_DATA}}",
  email: "hello@example.com",
  available: true,
  /** Transparent cut-out PNG in /public (e.g. "/portrait.png"). Enables the layered hero. */
  portrait: null as string | null,
  /** CV file URL (e.g. "/cv.pdf"). */
  cvUrl: null as string | null,
  socials: [
    { label: "Behance", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  marquee: [
    "Identity systems",
    "Editorial layout",
    "Packaging",
    "Typography",
    "Data storytelling",
    "Dashboards",
    "SQL & Python",
    "Insight that drives decisions",
  ],
  bio: [
    "{{BIO_PARAGRAPH_1}} — who you are, where you work from and what you care about.",
    "{{BIO_PARAGRAPH_2}} — how design and data meet in your work.",
  ],
  skills: {
    design: ["Brand identity", "Logo design", "Typography", "Editorial layout", "Packaging", "Adobe Illustrator", "Photoshop", "InDesign", "Figma"],
    data: ["Data cleaning", "Exploratory analysis", "SQL", "Python (Pandas)", "Excel", "Power BI", "Tableau", "Statistics", "Data visualisation"],
  },
  experience: [
    { years: "2024 — Now", role: "Freelance Designer & Analyst", org: "Independent" },
    { years: "2022 — 2024", role: "{{ROLE}}", org: "{{COMPANY}}" },
    { years: "2020 — 2022", role: "{{ROLE}}", org: "{{COMPANY}}" },
  ],
  services: [
    {
      n: "01",
      discipline: "design" as const,
      title: "Visual Identity & Graphic Design",
      text: "Identities that build trust and stay consistent from a favicon to a billboard.",
      items: ["Brand strategy & positioning", "Logo design", "Visual identity systems", "Brand guidelines", "Packaging & print", "Editorial & poster design"],
    },
    {
      n: "02",
      discipline: "data" as const,
      title: "Data Analysis & Visualisation",
      text: "From messy spreadsheets to clear answers your team can act on.",
      items: ["Data cleaning & modelling", "Exploratory analysis", "KPI dashboards", "SQL reporting", "Forecasting", "Insight presentations"],
    },
  ],
};

/** Shape of the site config. Values in the `settings` table (key "site") override these defaults. */
export type SiteConfig = typeof base;
export const defaults: SiteConfig = base;

/** Fields editable from /admin/settings. */
export const editableKeys = [
  "name", "monogram", "role", "location", "email", "available", "taglineDesign", "taglineData",
  "portrait", "cvUrl", "socials", "marquee", "bio", "skills", "experience",
] as const satisfies readonly (keyof SiteConfig)[];

export type Discipline = "design" | "data";

export const nav = [
  { label: "Design", href: "/design" },
  { label: "Data", href: "/data" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
