import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { defaults } from "@/lib/site";
import { SETTINGS_KEY, pickEditable } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { sb } = await requireAdmin();
  const { data } = await sb.from("settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  return (
    <>
      <PageHeader label="04 — Settings" title="Site settings" />
      <SettingsForm initial={{ ...defaults, ...pickEditable(data?.value) }} />
    </>
  );
}
