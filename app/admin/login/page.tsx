import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/admin/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const { user, isAdmin } = await getAdmin();
  if (user && isAdmin) redirect(next?.startsWith("/admin") ? next : "/admin");

  return (
    <main className="grid min-h-svh place-items-center bg-bg px-4 py-16 text-fg">
      <div className="w-full max-w-sm">
        <p className="micro font-mono text-muted">{"// Admin"}</p>
        <h1 className="display mt-4 text-5xl">Sign in</h1>

        {user && !isAdmin ? (
          <div className="mt-10 space-y-6 border border-line p-6 text-sm">
            <p>
              You&rsquo;re signed in as <strong>{user.email}</strong>, but this account isn&rsquo;t on the admin list yet.
            </p>
            <p className="text-muted">
              Add it in the Supabase SQL editor:
              <code className="mt-2 block border border-line p-3 font-mono text-xs break-all text-fg">
                insert into public.admins (user_id) values (&apos;{user.id}&apos;);
              </code>
            </p>
            <form action={signOut}>
              <button className="micro h-10 rounded-full border border-line-strong px-5 hover:bg-fg hover:text-bg">Sign out</button>
            </form>
          </div>
        ) : (
          <>
            {error === "link" && (
              <p role="alert" className="micro mt-6 font-mono">
                ✕ That sign-in link is invalid or has expired. Request a new one.
              </p>
            )}
            <LoginForm next={next} />
          </>
        )}
      </div>
    </main>
  );
}
