/** Placeholder used everywhere data-analysis work will appear, until the first data project is published. */
export function ComingSoon({
  size = "sm",
  className = "",
  children,
}: {
  size?: "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border-t border-line pt-6 ${className}`}>
      <p className="micro font-mono text-muted">{"// Data analysis"}</p>
      <p className={`display mt-4 ${size === "lg" ? "text-[length:var(--fs-h1)]" : "text-[length:var(--fs-h2)]"}`}>
        Coming soon
      </p>
      {children && <div className="mt-6 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}
