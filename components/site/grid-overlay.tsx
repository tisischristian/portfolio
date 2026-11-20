/** Hairline column lines (Kalathia reference), used only inside the home hero. 4 / 6 / 12 columns by breakpoint. */
export function GridLines({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <div
        className="container-x grid h-full"
        style={{
          gridTemplateColumns: "repeat(var(--cols), minmax(0, 1fr))",
          columnGap: "var(--gutter)",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`h-full border-x border-line ${
              i >= 6 ? "hidden lg:block" : i >= 4 ? "hidden sm:block" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
