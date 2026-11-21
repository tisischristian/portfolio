"use client";

import { useRef, useState } from "react";
import { describePasswordError, localPasswordProblems } from "@/lib/admin/password";
import { createClient } from "@/lib/supabase/client";
import { NewPasswordFields, Problems } from "./password-fields";
import { Field, btnPrimary, inputCls } from "./ui";

/**
 * Change password from the dashboard. The current password is re-checked first (Supabase
 * "secure password change" then accepts the update because the sign-in is fresh); the new one
 * is validated by Supabase against the rules in Authentication → Providers → Email.
 */
export function ChangePasswordForm({ email }: { email: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = String(fd.get("current_password") ?? "");
    const next = String(fd.get("new_password") ?? "");
    const confirm = String(fd.get("confirm_password") ?? "");
    setDone(false);

    const local = [...(current ? [] : ["Enter your current password."]), ...localPasswordProblems(next, confirm, current)];
    if (local.length) return setProblems(local);

    setBusy(true);
    setProblems([]);
    const sb = createClient();
    const check = await sb.auth.signInWithPassword({ email, password: current });
    if (check.error) {
      setBusy(false);
      return setProblems(
        check.error.code === "invalid_credentials" ? ["The current password is incorrect."] : describePasswordError(check.error),
      );
    }
    const { error } = await sb.auth.updateUser({ password: next });
    setBusy(false);
    if (error) return setProblems(describePasswordError(error));
    form.current?.reset();
    setDone(true);
  }

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="max-w-md space-y-6">
      <p className="text-sm text-muted">
        Signed in as <span className="text-fg">{email}</span>.
      </p>
      <Field label="Current password">
        <input name="current_password" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <NewPasswordFields />
      <Problems lines={problems} />
      {done && (
        <p role="status" className="micro font-mono normal-case">
          ✓ Password changed. Use the new one next time you sign in.
        </p>
      )}
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
