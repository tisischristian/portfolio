import type { Metadata } from "next";
import Link from "next/link";
import { deleteMessage, updateMessage } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, PageHeader, btnGhost } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { Arrow } from "@/components/ui/arrow";

export const metadata: Metadata = { title: "Messages" };

type Props = { searchParams: Promise<{ box?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const archived = (await searchParams).box === "archived";
  const { sb } = await requireAdmin();
  const { data } = await sb
    .from("messages")
    .select("*")
    .eq("archived", archived)
    .order("created_at", { ascending: false });
  const messages = data ?? [];

  return (
    <>
      <PageHeader label="03 — Messages" title="Messages" />
      <div className="micro mb-6 flex gap-4 font-mono">
        <Link href="/admin/messages" aria-current={!archived ? "page" : undefined} className={!archived ? "underline underline-offset-4" : "text-muted hover:text-fg"}>
          [inbox]
        </Link>
        <Link href="/admin/messages?box=archived" aria-current={archived ? "page" : undefined} className={archived ? "underline underline-offset-4" : "text-muted hover:text-fg"}>
          [archived]
        </Link>
      </div>

      {messages.length === 0 ? (
        <p className="border border-line p-10 text-center text-muted">{archived ? "Nothing archived." : "Inbox zero. New contact-form messages land here."}</p>
      ) : (
        <ul className="border-t border-line">
          {messages.map((m) => (
            <li key={m.id}>
              <details className="group border-b border-line" open={!m.read}>
                <summary className="flex cursor-pointer list-none items-center gap-3 py-4 hover:bg-line">
                  <span aria-hidden className={`ml-1 size-2 shrink-0 rounded-full ${m.read ? "border border-current" : "bg-fg"}`} />
                  <span className={`truncate ${m.read ? "" : "font-semibold"}`}>{m.name}</span>
                  <span className="hidden truncate text-sm text-muted sm:block">{m.email}</span>
                  <span className="ml-auto flex shrink-0 items-center gap-2">
                    <Badge>{m.interest ?? "—"}</Badge>
                    <time className="font-mono text-xs text-muted" dateTime={m.created_at}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </time>
                  </span>
                </summary>
                <div className="space-y-5 pb-6 pl-6">
                  <dl className="micro grid gap-x-8 gap-y-2 font-mono sm:grid-cols-3">
                    <div><dt className="text-muted">Email</dt><dd className="normal-case">{m.email}</dd></div>
                    <div><dt className="text-muted">Interest</dt><dd>{m.interest ?? "—"}</dd></div>
                    <div><dt className="text-muted">Budget</dt><dd>{m.budget ?? "—"}</dd></div>
                  </dl>
                  <p className="max-w-2xl whitespace-pre-line">{m.body}</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry")}`} className={btnGhost}>
                      Reply <Arrow />
                    </a>
                    <form action={updateMessage.bind(null, m.id, { read: !m.read })}>
                      <button className={btnGhost}>Mark {m.read ? "unread" : "read"}</button>
                    </form>
                    <form action={updateMessage.bind(null, m.id, { archived: !archived, read: true })}>
                      <button className={btnGhost}>{archived ? "Move to inbox" : "Archive"}</button>
                    </form>
                    {archived && (
                      <form action={deleteMessage.bind(null, m.id)}>
                        <ConfirmButton message={`Delete the message from ${m.name} permanently? This can't be undone.`} className={`${btnGhost} hover:bg-fg hover:text-bg`}>
                          Delete forever
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
