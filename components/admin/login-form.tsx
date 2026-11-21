"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "link" | "reset">("password");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "sent" | "error"; msg?: string }>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const sb = createClient();
    setStatus({ kind: "busy" });

    if (mode === "reset") {
      // Supabase emails a one-time link; it lands on /admin/reset-password where a new password is chosen.
      const redirect = new URL("/admin/auth/callback", window.location.origin);
      redirect.searchParams.set("next", "/admin/reset-password");
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect.toString() });
      if (error && error.status === 429) return setStatus({ kind: "error", msg: "Too many requests. Wait a minute and try again." });
      // Same message whether or not the address has an account, so the form can't be used to find accounts.
      setStatus({ kind: "sent", msg: "reset" });
      return;
    }

    if (mode === "link") {
      const redirect = new URL("/admin/auth/callback", window.location.origin);
      if (next) redirect.searchParams.set("next", next);
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: redirect.toString() },
      });
      setStatus(error ? { kind: "error", msg: error.message } : { kind: "sent" });
      return;
    }

    const { error } = await sb.auth.signInWithPassword({ email, password: String(fd.get("password") ?? "") });
    if (error) return setStatus({ kind: "error", msg: error.message });
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  if (status.kind === "sent") {
    return (
      <p role="status" className="mt-10 border border-line p-6 text-sm">
        {status.msg === "reset"
          ? "If that email belongs to an admin account, a password reset link is on its way. Open it in this same browser."
          : "Check your inbox — a sign-in link is on its way. You can close this tab."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-6">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </Field>
      {mode === "password" && (
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
        </Field>
      )}
      {status.kind === "error" && (
        <p role="alert" className="micro font-mono">
          ✕ {status.msg}
        </p>
      )}
      <button
        type="submit"
        disabled={status.kind === "busy"}
        className="micro h-12 w-full rounded-full bg-fg text-bg transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
      >
        {status.kind === "busy"
          ? "Please wait…"
          : mode === "password"
            ? "Sign in"
            : mode === "reset"
              ? "Email me a reset link"
              : "Email me a sign-in link"}
      </button>
      <div className="flex flex-col items-center gap-3">
        {mode === "password" && (
          <button type="button" onClick={() => (setMode("reset"), setStatus({ kind: "idle" }))} className="micro text-muted underline-offset-4 hover:text-accent-text hover:underline">
            Forgot password?
          </button>
        )}
        <button
          type="button"
          onClick={() => (setMode(mode === "password" ? "link" : "password"), setStatus({ kind: "idle" }))}
          className="micro text-muted underline-offset-4 hover:text-accent-text hover:underline"
        >
          {mode === "password" ? "Use a magic link instead" : "Back to password sign-in"}
        </button>
      </div>
    </form>
  );
}
