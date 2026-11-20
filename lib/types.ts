import type { Discipline } from "./site";

export type ImageRef = { url?: string | null; alt: string; caption?: string };

/** Ordered content blocks stored in `projects.blocks` (jsonb). */
export type Block =
  | { type: "heading"; text: string }
  | { type: "text"; text: string } // paragraphs separated by blank lines
  | ({ type: "image" } & ImageRef)
  | ({ type: "full-image" } & ImageRef)
  | { type: "image-grid"; columns: 2 | 3; images: ImageRef[] }
  | { type: "video"; url: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; language?: string; code: string }
  | {
      type: "chart";
      kind: "line" | "bar" | "area";
      title?: string;
      xKey: string;
      series: string[];
      data: Record<string, string | number>[];
      caption?: string;
    }
  | { type: "embed"; url: string; title: string; ratio?: string }
  | { type: "metrics"; items: Metric[] }
  | { type: "divider" };

export type Metric = { label: string; value: string };

/** Mirrors the `public.projects` table. */
export type Project = {
  id: string;
  discipline: Discipline;
  title: string;
  slug: string;
  summary: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  year: number | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  // design
  client: string | null;
  role: string | null;
  deliverables: string[] | null;
  palette: string[] | null;
  fonts: string[] | null;
  // data
  question: string | null;
  dataset_source: string | null;
  dataset_size: string | null;
  tools: string[] | null;
  metrics: Metric[];
  embed_url: string | null;
  github_url: string | null;
  notebook_url: string | null;
  report_url: string | null;
  // content
  blocks: Block[];
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
};

export const isSample = (p: Pick<Project, "id">) => p.id.startsWith("sample-");
