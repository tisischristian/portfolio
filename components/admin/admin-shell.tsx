"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/admin/actions";
import { Arrow } from "@/components/ui/arrow";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "/admin", label: "Dashboard", n: "00" },
  { href: "/admin/projects", label: "Exhibits", n: "01" },
  { href: "/admin/thoughts", label: "Thoughts", n: "02" },
  { href: "/admin/media", label: "Media", n: "03" },
  { href: "/admin/messages", label: "Messages", n: "04" },
  { href: "/admin/settings", label: "Settings", n: "05" },
];

export function AdminShell({
  email,
  unread,
  children,
}: {
  email: string;
  unread: number;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className="micro flex h-10 items-center gap-3 rounded-full px-4 transition-colors hover:bg-accent/15 hover:text-accent-text aria-[current=page]:bg-accent aria-[current=page]:text-ink"
        >
          <span className="font-mono opacity-60">{l.n}</span>
          {l.label}
          {l.href === "/admin/messages" && unread > 0 && (
            <span className="ml-auto font-mono text-accent-text">[{unread}]</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="micro space-y-3 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center justify-between hover:underline">
        View site <Arrow />
      </Link>
      <p className="truncate font-mono text-muted normal-case" title={email}>
        {email}
      </p>
      <div className="flex items-center justify-between">
        <form action={signOut}>
          <button className="text-muted hover:text-accent-text hover:underline">Sign out</button>
        </form>
        <ThemeToggle className="-mr-2" />
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-bg text-fg lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col justify-between border-r border-line p-4 lg:flex">
        <div>
          <Link href="/admin" className="micro mb-8 flex items-center gap-3 px-4 pt-2 font-semibold">
            <span className="font-mono">[ADMIN]</span>
            <span aria-hidden className="h-px w-6 bg-current" />
            Studio
          </Link>
          {nav}
        </div>
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="micro font-mono font-semibold">
          [ADMIN]
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="micro h-9 rounded-full border border-line-strong px-4"
        >
          {open ? "Close" : "Menu"}
          {!open && unread > 0 && <span className="ml-2 font-mono">[{unread}]</span>}
        </button>
      </header>
      <div id="admin-menu" hidden={!open} className="space-y-6 border-b border-line bg-bg p-4 lg:hidden">
        {nav}
        {footer}
      </div>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
