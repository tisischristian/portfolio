import { SectionLabel } from "@/components/ui/section-label";
import { getSite } from "@/lib/site-settings";
import { Marquee } from "./marquee";

/**
 * "Brands I've worked with" — an endless, scroll-reactive logo slider.
 * Logos are rendered as monochrome silhouettes (black in light mode, white in dark mode)
 * so any uploaded logo sits inside the black-and-white system; names show when there's no logo.
 */
export async function Brands({ index = "02" }: { index?: string }) {
  const site = await getSite();
  const brands = site.brands.filter((b) => b.name.trim());
  if (!brands.length) return null;

  const item = (b: (typeof brands)[number]) => {
    const inner = b.logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={b.logo}
        alt={b.name}
        loading="lazy"
        decoding="async"
        className="brand-logo h-9 w-auto max-w-[180px] object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:h-12"
      />
    ) : (
      <span className="display text-[clamp(2rem,5vw,3.75rem)] text-muted transition-colors duration-300 group-hover:text-fg">
        {b.name}
      </span>
    );
    return b.href ? (
      <a href={b.href} target="_blank" rel="noreferrer" className="group block" aria-label={b.name}>
        {inner}
      </a>
    ) : (
      <span className="group block">{inner}</span>
    );
  };

  // Long enough to fill wide screens even with only a few brands.
  const items = brands.length < 6 ? [...brands, ...brands] : brands;
  const half = Math.ceil(items.length / 2);

  return (
    <section aria-labelledby="brands-title" className="py-20 lg:py-28">
      <div className="container-x flex items-end justify-between gap-6">
        <SectionLabel index={index}>
          <span id="brands-title">Brands I&rsquo;ve worked with</span>
        </SectionLabel>
        <p className="micro font-mono text-muted">[{brands.length}]</p>
      </div>
      <div className="mt-10 space-y-6 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] sm:space-y-10">
        <Marquee items={items.map(item)} separator={false} speed={0.05} gapClass="gap-16 pr-16" />
        {brands.length >= 6 && (
          <Marquee items={[...items.slice(half), ...items.slice(0, half)].map(item)} separator={false} speed={0.035} reverse gapClass="gap-16 pr-16" />
        )}
      </div>
      {/* Plain list for screen readers (the slider repeats items and is decorative). */}
      <ul className="sr-only">
        {brands.map((b) => (
          <li key={b.name}>{b.name}</li>
        ))}
      </ul>
    </section>
  );
}
