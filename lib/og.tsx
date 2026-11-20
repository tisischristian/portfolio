import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// The app normally runs with cwd = the project folder (Vercel, `npm run dev`); the local
// preview launcher runs from the parent folder, so fall back to ./portfolio as well.
const fontDir = async () => {
  const primary = join(process.cwd(), "app", "fonts");
  try {
    await access(join(primary, "BBHBogle-Regular.ttf"));
    return primary;
  } catch {
    return join(process.cwd(), "portfolio", "app", "fonts");
  }
};

const fonts = async () => {
  const dir = await fontDir();
  const [bogle, plex] = await Promise.all([
    readFile(join(dir, "BBHBogle-Regular.ttf")),
    readFile(join(dir, "IBMPlexMono-Regular.ttf")),
  ]);
  return [
    { name: "Bogle", data: bogle, weight: 400 as const, style: "normal" as const },
    { name: "Plex", data: plex, weight: 400 as const, style: "normal" as const },
  ];
};

/** Black-and-white share card: hairline grid, label, big title, name + role footer. */
export async function ogImage({ label, title, name, role }: { label: string; title: string; name: string; role: string }) {
  const size = title.length > 22 ? 96 : title.length > 14 ? 124 : 156;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#060606",
          color: "#ffffff",
          padding: "56px 64px",
          position: "relative",
          fontFamily: "Plex",
        }}
      >
        {/* 6-column hairline grid */}
        <div style={{ position: "absolute", inset: 0, display: "flex", padding: "0 64px" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.10)", borderRight: i === 5 ? "1px solid rgba(255,255,255,0.10)" : "none" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2, color: "#9f9f9f" }}>
          <span>{`// ${label.toUpperCase()}`}</span>
          <span>{name.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", fontFamily: "Bogle", fontSize: size, lineHeight: 0.95, textTransform: "uppercase" }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 2 }}>
          <span>{role.toUpperCase()}</span>
          <span style={{ color: "#9f9f9f" }}>DESIGN · DATA</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts() },
  );
}

/** Monogram favicon / touch icon. */
export async function iconImage(monogram: string, px: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060606",
          color: "#ffffff",
          fontFamily: "Bogle",
          fontSize: px * 0.5,
          borderRadius: px >= 128 ? 0 : px * 0.2,
        }}
      >
        {monogram.slice(0, 2).toUpperCase()}
      </div>
    ),
    { width: px, height: px, fonts: (await fonts()).slice(0, 1) },
  );
}
