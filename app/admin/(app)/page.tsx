import Link from "next/link";
import { Badge, PageHeader, btnGhost, btnPrimary } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";

export default async function Dashboard() {
  const { sb } = await requireAdmin();
  const [{ data: projects }, { data: messages }, { count: mediaCount }] = await Promise.all([
    sb.from("projects").select("id, title, discipline, status, updated_at").order("updated_at", { ascending: false }),
    sb.from("messages").select("id, name, interest, read, created_at").eq("archived", false).order("created_at", { ascending: false }).limit(5),
    sb.from("media").select("id", { count: "exact", head: true }),
  ]);

  const list = projects ?? [];
  const count = (d: string, s?: string) => list.filter((p) => p.discipline === d && (!s || p.status === s)).length;
  const unread = (messages ?? []).filter((m) => !m.read).length;

  const tiles = [
    { label: "Design projects", value: count("design"), sub: `${count("design", "published")} published · ${count("design", "draft")} drafts`, mark: "■" },
    { label: "Data projects", value: count("data"), sub: `${count("data", "published")} published · ${count("data", "draft")} drafts`, mark: "□" },
    { label: "Unread messages", value: unread, sub: "From the contact form", mark: "✉" },
    { label: "Media files", value: mediaCount ?? 0, sub: "In the library", mark: "◐" },
  ];

  return (
    <>
      <PageHeader label="00 — Dashboard" title="Overview">
        <Link href="/admin/projects/new?discipline=design" className={btnPrimary}>
          + New design project
        </Link>
        <Link href="/admin/projects/new?discipline=data" className={btnGhost}>
          + New data project
        </Link>
      </PageHeader>

      {list.length === 0 && (
        <p className="mb-10 border border-line p-5 text-sm text-muted">
          No projects yet — your public site is showing the sample projects. Publish your first project and the samples
          disappear automatically.
        </p>
      )}

      <dl className="grid border-t border-l border-line sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="border-r border-b border-line p-6">
            <dt className="micro flex justify-between font-mono text-muted">
              {t.label} <span aria-hidden>{t.mark}</span>
            </dt>
            <dd className="mt-6 font-mono text-6xl leading-none tracking-tight">{t.value}</dd>
            <dd className="micro mt-3 text-muted">{t.sub}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-14 xl:grid-cols-2">
        <section>
          <h2 className="micro mb-4 font-mono text-muted">{"// Recently edited"}</h2>
          <ul className="border-t border-line">
            {list.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3 border-b border-line py-3.5 hover:bg-line">
                  <span aria-hidden className="w-4 text-center">{p.discipline === "design" ? "■" : "□"}</span>
                  <span className="flex-1 truncate">{p.title}</span>
                  <Badge solid={p.status === "published"}>{p.status}</Badge>
                </Link>
              </li>
            ))}
            {list.length === 0 && <li className="border-b border-line py-3.5 text-sm text-muted">Nothing yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="micro mb-4 font-mono text-muted">{"// Latest messages"}</h2>
          <ul className="border-t border-line">
            {(messages ?? []).map((m) => (
              <li key={m.id}>
                <Link href="/admin/messages" className="flex items-center gap-3 border-b border-line py-3.5 hover:bg-line">
                  <span aria-hidden className={`size-2 rounded-full ${m.read ? "border border-current" : "bg-fg"}`} />
                  <span className="flex-1 truncate">{m.name}</span>
                  <Badge>{m.interest ?? "—"}</Badge>
                  <span className="font-mono text-xs text-muted">{new Date(m.created_at).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
            {!messages?.length && <li className="border-b border-line py-3.5 text-sm text-muted">No messages yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
