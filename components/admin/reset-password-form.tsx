"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { describePasswordError, localPasswordProblems } from "@/lib/admin/password";
import { createClient } from "@/lib/supabase/client";
import { NewPasswordFields, Problems } from "./password-fields";

/** Sets a new password after the emailed reset link signed the user in. Rules are enforced by Supabase. */
export function ResetPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get("new_password") ?? "");
    const local = localPasswordProblems(next, String(fd.get("confirm_password") ?? ""));
    if (local.length) return setProblems(local);

    setBusy(true);
    setProblems([]);
    const { error } = await createClient().auth.updateUser({ password: next });
    setBusy(false);
    if (error) return setProblems(describePasswordError(error));
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 space-y-6">
      <NewPasswordFields autoFocus />
      <Problems lines={problems} />
      <button
        type="submit"
        disabled={busy}
        className="micro h-12 w-full rounded-full bg-fg text-bg transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
