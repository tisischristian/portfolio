import Link from "next/link";
import type { Discipline } from "@/lib/site";

/** `[ DESIGN | DATA ]` switch in the nav. */
export function DisciplineSwitch({
  active,
  className = "",
}: {
  active: Discipline | null;
  className?: string;
}) {
  const item = (d: Discipline, label: string) => {
    const isActive = active === d;
    return (
      <Link
        href={`/${d}`}
        aria-current={isActive ? "page" : undefined}
        className={`micro flex h-8 items-center rounded-full px-3.5 transition-colors ${
          isActive ? "bg-fg text-bg" : "text-fg hover:bg-line"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Discipline"
      className={`flex items-center gap-1 rounded-full border border-line-strong p-1 ${className}`}
    >
      {item("design", "Design")}
      {item("data", "Data")}
    </nav>
  );
}
