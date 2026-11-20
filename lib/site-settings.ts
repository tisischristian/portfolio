import { cache } from "react";
import { defaults, editableKeys, type SiteConfig } from "./site";
import { publicClient } from "./supabase/public";

export const SETTINGS_KEY = "site";

/** Keep only known, editable keys from a stored settings object. */
export function pickEditable(value: unknown): Partial<SiteConfig> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const k of editableKeys) if (k in value) out[k] = (value as Record<string, unknown>)[k];
  return out as Partial<SiteConfig>;
}

/** Code defaults (lib/site.ts) overridden by what was saved in /admin/settings. */
export const getSite = cache(async (): Promise<SiteConfig> => {
  const sb = publicClient();
  if (!sb) return defaults;
  const { data, error } = await sb.from("settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  if (error) console.error("[settings]", error.message);
  return { ...defaults, ...pickEditable(data?.value) };
});
