export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`micro font-mono text-muted ${className}`}>
      {"// "}
      {index ? `${index} — ` : ""}
      {children}
    </p>
  );
}
