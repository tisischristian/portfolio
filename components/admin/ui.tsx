/** Small shared admin UI primitives. */

export const inputCls =
  "w-full rounded-none border border-line-strong bg-transparent px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent aria-[invalid=true]:border-accent";

export const btn =
  "micro inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 transition-colors disabled:opacity-40";
export const btnPrimary = `${btn} bg-fg text-bg hover:bg-accent hover:text-ink`;
export const btnGhost = `${btn} border border-line-strong hover:border-accent hover:text-accent-text`;

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="micro mb-2 block font-mono text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="micro mt-1.5 block font-mono">✕ {error}</span>}
    </label>
  );
}

export function PageHeader({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
      <div>
        <p className="micro font-mono text-muted">
          <span className="text-accent-text">{"// "}</span>
          {label}
        </p>
        <h1 className="display mt-3 text-[clamp(2.25rem,5vw,3.75rem)]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function Badge({ children, solid = false }: { children: React.ReactNode; solid?: boolean }) {
  return (
    <span
      className={`micro inline-flex h-6 items-center rounded-full px-2.5 font-mono text-[0.65rem] ${
        solid ? "bg-accent text-ink" : "border border-line-strong text-muted"
      }`}
    >
      {children}
    </span>
  );
}
