import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Signed-in user + whether they are on the admin allow-list. */
export async function getAdmin() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { sb, user: null, isAdmin: false };
  const { data } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { sb, user, isAdmin: !!data };
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin() {
  const { sb, user, isAdmin } = await getAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return { sb, user };
}
