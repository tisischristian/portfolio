"use client";

export function FilterChips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {["All", ...options].map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o)}
            className={`micro h-9 rounded-full border px-4 transition-colors ${
              active ? "border-fg bg-fg text-bg" : "border-line-strong hover:border-fg"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
