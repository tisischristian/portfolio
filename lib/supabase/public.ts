import { createClient as create, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Cookie-free client for public, cacheable reads (published projects, settings)
 * and the anonymous contact-form insert. Keeps public pages statically renderable.
 */
export function publicClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? create(url, key, { auth: { persistSession: false } }) : null;
  return client;
}
