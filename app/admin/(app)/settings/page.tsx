import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { defaults } from "@/lib/site";
import { SETTINGS_KEY, pickEditable } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { sb, user } = await requireAdmin();
  const { data } = await sb.from("settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  return (
    <>
      <PageHeader label="05 — Settings" title="Site settings" />
      <SettingsForm initial={{ ...defaults, ...pickEditable(data?.value) }} />

      {/* Separate form: account security is not part of the site content. */}
      <section id="account" className="mt-16 grid scroll-mt-24 gap-6 border-t border-line py-10 lg:grid-cols-[220px_1fr]">
        <h2 className="micro font-mono text-muted">{"// 08 — Account & password"}</h2>
        <ChangePasswordForm email={user.email ?? ""} />
      </section>
    </>
  );
}
