import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sb, user } = await requireAdmin();
  const { count } = await sb
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("read", false)
    .eq("archived", false);

  return (
    <AdminShell email={user.email ?? ""} unread={count ?? 0}>
      {children}
    </AdminShell>
  );
}
