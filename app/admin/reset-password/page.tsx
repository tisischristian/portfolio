import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { getAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

/** Landing page for the emailed reset link (the callback route has already signed the user in). */
export default async function ResetPasswordPage() {
  const { user } = await getAdmin();
  if (!user) redirect("/admin/login?error=link");

  return (
    <main className="grid min-h-svh place-items-center bg-bg px-4 py-16 text-fg">
      <div className="w-full max-w-sm">
        <p className="micro font-mono text-muted">{"// Admin"}</p>
        <h1 className="display mt-4 text-5xl">New password</h1>
        <p className="mt-4 text-sm text-muted">
          Choose a new password for <span className="text-fg">{user.email}</span>.
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
