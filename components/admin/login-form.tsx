"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "link">("password");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "sent" | "error"; msg?: string }>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const sb = createClient();
    setStatus({ kind: "busy" });

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
        Check your inbox — a sign-in link is on its way. You can close this tab.
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
        className="micro h-12 w-full rounded-full bg-fg text-bg transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {status.kind === "busy" ? "Please wait…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "link" : "password")}
        className="micro w-full text-muted underline-offset-4 hover:text-fg hover:underline"
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </button>
    </form>
  );
}
