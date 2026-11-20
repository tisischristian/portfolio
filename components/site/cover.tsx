import Image from "next/image";
import type { Discipline } from "@/lib/site";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** Generated monochrome artwork used when a project has no image yet. */
function Placeholder({ seed, discipline }: { seed: string; discipline: Discipline }) {
  const h = hash(seed);
  const dark = true; // all sections are black now
  const bg = dark ? "#151514" : "#EDEDEC";
  const fg = dark ? "#F4F4F2" : "#060606";
  const mid = dark ? "#40403E" : "#9F9F9F";
  const v = h % 5;
  const letter = seed.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() || "A";

  let art: React.ReactNode;
  if (discipline === "design") {
    art = [
      <g key="0">
        <circle cx="200" cy="150" r="96" fill="none" stroke={fg} strokeWidth="26" />
        <circle cx="200" cy="150" r="34" fill={fg} />
      </g>,
      <text key="1" x="200" y="232" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="260" fill={fg}>
        {letter}
      </text>,
      <g key="2">
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={-80 + i * 40} y="-40" width="16" height="420" fill={i % 3 ? mid : fg} transform="rotate(28 200 150)" />
        ))}
      </g>,
      <g key="3">
        {Array.from({ length: 63 }).map((_, i) => (
          <circle key={i} cx={40 + (i % 9) * 40} cy={30 + Math.floor(i / 9) * 40} r={(i + h) % 4 === 0 ? 12 : 4} fill={fg} />
        ))}
      </g>,
      <g key="4">
        <rect x="70" y="40" width="260" height="70" fill={fg} />
        <rect x="70" y="122" width="170" height="70" fill={mid} />
        <rect x="70" y="204" width="220" height="56" fill="none" stroke={fg} strokeWidth="6" />
      </g>,
    ][v];
  } else {
    const pts = Array.from({ length: 9 }, (_, i) => 60 + ((h >> i) % 150));
    art = [
      <g key="0">
        {pts.map((p, i) => (
          <rect key={i} x={40 + i * 36} y={260 - p} width="22" height={p} fill={i === (h % 9) ? fg : mid} />
        ))}
        <line x1="30" y1="260" x2="370" y2="260" stroke={fg} strokeWidth="2" />
      </g>,
      <g key="1">
        <polyline points={pts.map((p, i) => `${40 + i * 40},${270 - p}`).join(" ")} fill="none" stroke={fg} strokeWidth="5" />
        <polyline points={pts.map((p, i) => `${40 + i * 40},${290 - p * 0.6}`).join(" ")} fill="none" stroke={mid} strokeWidth="3" strokeDasharray="8 6" />
      </g>,
      <g key="2">
        {Array.from({ length: 40 }).map((_, i) => {
          const x = 40 + ((h * (i + 3)) % 320);
          const y = 260 - (x - 40) * 0.6 + (((h >> (i % 16)) % 70) - 35);
          return <circle key={i} cx={x} cy={y} r="6" fill={i % 5 ? mid : fg} />;
        })}
      </g>,
      <g key="3">
        <path d={`M30 270 ${pts.map((p, i) => `L${30 + i * 42} ${270 - p}`).join(" ")} L366 270 Z`} fill={mid} />
        <path d={`M30 270 ${pts.map((p, i) => `L${30 + i * 42} ${270 - p * 0.55}`).join(" ")} L366 270 Z`} fill={fg} />
      </g>,
      <g key="4">
        <circle cx="200" cy="150" r="100" fill="none" stroke={mid} strokeWidth="40" />
        <circle cx="200" cy="150" r="100" fill="none" stroke={fg} strokeWidth="40" strokeDasharray={`${200 + (h % 300)} 999`} transform="rotate(-90 200 150)" />
      </g>,
    ][v];
  }

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <rect width="400" height="300" fill={bg} />
      {art}
    </svg>
  );
}

/**
 * Project imagery. Grayscale by default, full colour when an ancestor `.group` is hovered/focused.
 * Falls back to generated artwork when there is no image.
 */
export function Cover({
  src,
  alt,
  seed,
  discipline,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  reveal = true,
}: {
  src?: string | null;
  alt: string;
  seed: string;
  discipline: Discipline;
  className?: string;
  sizes?: string;
  priority?: boolean;
  reveal?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-line ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-[filter,transform] duration-700 ease-[var(--ease)] group-hover:scale-[1.03] group-focus-visible:scale-[1.03] ${
            reveal ? "grayscale group-hover:grayscale-0 group-focus-visible:grayscale-0" : ""
          }`}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 transition-transform duration-700 ease-[var(--ease)] group-hover:scale-[1.03]"
        >
          <Placeholder seed={seed} discipline={discipline} />
        </div>
      )}
    </div>
  );
}
