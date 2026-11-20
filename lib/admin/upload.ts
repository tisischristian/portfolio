"use client";

import { createClient } from "@/lib/supabase/client";

export type MediaRow = {
  id: string;
  url: string;
  path: string;
  mime: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  alt: string | null;
  blur_data_url: string | null;
  created_at: string;
};

const MB = 1024 * 1024;
// Supabase free plan caps a single upload at 50 MB.
const LIMITS: Record<string, number> = { image: 20 * MB, video: 50 * MB, other: 25 * MB };

export const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/webm",
  pdf: "application/pdf",
  any: "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,application/pdf,text/csv,application/json",
};

const ALLOWED = new Set(ACCEPT.any.split(","));

const slugify = (s: string) =>
  s.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";

async function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Encode failed"))), type, quality));
}

/** Resize to ≤2560px and re-encode as WebP; returns dimensions + a tiny blur placeholder. */
async function processImage(file: File) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob = await toBlob(c, "image/webp", 0.86);

  const t = document.createElement("canvas");
  t.width = 16;
  t.height = Math.max(1, Math.round((16 * h) / w));
  t.getContext("2d")!.drawImage(bmp, 0, 0, t.width, t.height);
  const blur = t.toDataURL("image/webp", 0.5);
  bmp.close();

  // Keep the original if re-encoding made it bigger (already well-compressed files).
  return blob.size < file.size || scale < 1
    ? { blob, type: "image/webp", ext: "webp", w, h, blur }
    : { blob: file as Blob, type: file.type, ext: file.name.split(".").pop() ?? "img", w, h, blur };
}

/** Upload one file to the public-media bucket and record it in the media table. */
export async function uploadFile(file: File, alt = ""): Promise<MediaRow> {
  if (!ALLOWED.has(file.type)) throw new Error(`${file.name}: file type not supported (${file.type || "unknown"})`);
  const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other";
  if (file.size > LIMITS[kind]) throw new Error(`${file.name}: too large (max ${LIMITS[kind] / MB} MB)`);

  let body: Blob = file;
  let type = file.type;
  let ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  let width: number | null = null;
  let height: number | null = null;
  let blur: string | null = null;

  if (kind === "image" && file.type !== "image/gif") {
    const r = await processImage(file);
    ({ blob: body, type, ext } = r);
    width = r.w;
    height = r.h;
    blur = r.blur;
  }

  const d = new Date();
  const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${slugify(file.name)}.${ext}`;

  const sb = createClient();
  const up = await sb.storage.from("public-media").upload(path, body, {
    contentType: type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (up.error) throw new Error(`${file.name}: ${up.error.message}`);

  const url = sb.storage.from("public-media").getPublicUrl(path).data.publicUrl;
  const { data, error } = await sb
    .from("media")
    .insert({ url, path, mime: type, width, height, size_bytes: body.size, alt: alt || null, blur_data_url: blur })
    .select()
    .single();
  if (error) throw new Error(`${file.name}: ${error.message}`);
  return data as MediaRow;
}

export const formatBytes = (n: number | null) =>
  n == null ? "—" : n > MB ? `${(n / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
