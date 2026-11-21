import Image from "next/image";
import type { SiteConfig } from "@/lib/site";
import { getSite } from "@/lib/site-settings";
import { GridLines } from "./grid-overlay";
import { Marquee } from "./marquee";
import { Reveal } from "@/components/motion/reveal";

function CircleBadge({ site }: { site: SiteConfig }) {
  // Kept short so it fits the ring at a legible 12px (Lighthouse flags text under 12px).
  const text = `${site.available ? "Available for work" : "Currently booked"} • ${new Date().getFullYear()} • `;
  return (
    <div className="relative size-28 sm:size-32" aria-hidden>
      <svg viewBox="0 0 140 140" className="size-full animate-[spin_24s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path id="badge-circle" d="M70,70 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" />
        </defs>
        <text className="fill-current font-mono text-[12px] uppercase" textLength={336} lengthAdjust="spacing">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto grid size-8 place-items-center rounded-full border-[3px] border-current">
        <span className="size-2 rounded-full bg-accent" />
      </span>
    </div>
  );
}

/**
 * Home hero: visible grid (Kalathia), giant name, optional portrait layered between
 * a solid and a translucent copy of the name (Graham), grain + bottom ticker (Howat).
 */
export async function Hero() {
  const site = await getSite();
  const words = site.name.trim().split(/\s+/);
  // Scale the name so its longest word always fits the content width
  // (BBH Bogle caps measure ≈0.43em per letter, M/W included; 0.48 leaves headroom;
  // indented lines get 1/6 less room).
  const longest = Math.max(...words.map((w, i) => w.length * (i % 2 ? 1.2 : 1)), 4);
  const fontSize = `min(clamp(4rem, 22vw, 13rem), calc((min(100vw, var(--max) + 2 * var(--margin)) - 2 * var(--margin)) / ${(longest * 0.48).toFixed(2)}))`;
  // `overlay` = the copy that sits ON TOP of the portrait (Alex Graham reference): a solid fill in the
  // theme's text colour at 75%, so a little of the photo shows through where they overlap. Off the photo it
  // lands on the solid name underneath, so those letters still read as fully solid.
  const Name = ({ overlay = false }: { overlay?: boolean }) => (
    <Reveal
      as={overlay ? "p" : "h1"}
      aria-hidden={overlay || undefined}
      style={{ fontSize }}
      className={`display ${overlay ? "text-fg/75" : ""}`}
    >
      {words.map((w, i) => (
        <span key={i} className={`block ${i % 2 ? "lg:pl-[16.66%]" : ""}`}>
          {w}
        </span>
      ))}
    </Reveal>
  );

  return (
    <section className="grain relative flex min-h-svh flex-col overflow-hidden pb-20 sm:pb-0">
      <GridLines className="absolute inset-0" />

      <div className="container-x relative flex flex-1 flex-col pt-28 sm:pt-32">
        {/* Portrait: anchored to the whole hero (above the ticker), between the solid name (z-0)
            and the outlined name + UI text (z-20). */}
        {site.portrait && (
          <div className="pointer-events-none absolute right-0 bottom-0 z-10 hidden h-[88%] w-[min(92%,1100px)] max-lg:[mask-image:linear-gradient(to_bottom,#000_62%,transparent_94%)] sm:block lg:right-[3%] lg:h-[96%] lg:w-[min(62%,1100px)]">
            <Image
              src={site.portrait}
              alt=""
              fill
              priority
              sizes="(min-width:1024px) 62vw, (min-width:640px) 92vw, 1px"
              className="object-contain object-bottom grayscale"
            />
          </div>
        )}

        <div className="relative z-20 flex items-start justify-between gap-6">
          <p className="micro max-w-56 font-mono text-muted">
            {"// "}
            {site.role}
          </p>
          <CircleBadge site={site} />
        </div>

        {/* Phone: the photo sits in the flow, edge to edge and as tall as the screen allows, so it's as
            big as on desktop without running behind the role line, badge or bottom info. The name is
            pulled up over its lower part for the same layered effect (solid name behind, 75% copy in front). */}
        {site.portrait && (
          <div
            className="pointer-events-none relative z-10 -mx-[var(--margin)] mt-6 [mask-image:linear-gradient(to_bottom,#000_80%,transparent)] sm:hidden"
            style={{ height: "min(133vw, 64svh)" }}
          >
            <Image src={site.portrait} alt="" fill priority sizes="(min-width:640px) 1px, 130vw" className="object-cover object-bottom grayscale" />
          </div>
        )}

        <div className={`relative mt-auto pt-10 ${site.portrait ? "max-sm:mt-[-34vw] max-sm:pt-0" : ""}`}>
          <div className="relative z-0">
            <Name />
          </div>
          {site.portrait && (
            <div className="absolute inset-x-0 bottom-0 z-20">
              <Name overlay />
            </div>
          )}
        </div>

        <div className="micro relative z-20 mt-10 mb-8 grid grid-cols-2 items-end gap-6 sm:mb-10 lg:grid-cols-12">
          <p className="whitespace-pre-line text-muted lg:col-span-3">{site.location}</p>
          <p className="hidden max-w-xs text-muted lg:col-span-3 lg:block">
            {site.heroBlurb}
          </p>
          <ul className="font-mono lg:col-span-3 lg:col-start-10">
            <li>Visual identity</li>
            <li>Graphic design</li>
            <li>Data analysis</li>
            <li>Dashboards</li>
          </ul>
        </div>
      </div>

      <Marquee items={site.marquee} className="micro relative border-t border-line py-4 text-[0.8rem]" />
    </section>
  );
}
