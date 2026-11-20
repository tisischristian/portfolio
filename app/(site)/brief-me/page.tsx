import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { SectionLabel } from "@/components/ui/section-label";
import { getSite } from "@/lib/site-settings";
import { Reveal } from "@/components/motion/reveal";
import { Arrow } from "@/components/ui/arrow";

export const metadata: Metadata = { title: "Brief Me", description: "Start a design or data project." };

export default async function Contact() {
  const site = await getSite();
  return (
    <>
      <header className="container-x pt-36 pb-16 sm:pt-44">
        <SectionLabel>Brief me</SectionLabel>
        <Reveal as="h1" className="display mt-6 text-[length:var(--fs-hero)]">
          Brief me
        </Reveal>
      </header>

      <section className="container-x grid gap-16 pb-28 lg:grid-cols-12 lg:pb-40">
        <aside className="space-y-10 lg:col-span-4">
          <p className="max-w-sm text-muted">
            Tell me about your brand, your data or both. I usually reply within two working days.
          </p>
          <div className="micro space-y-6">
            <div>
              <p className="mb-2 font-mono text-muted">[Email]</p>
              <a href={`mailto:${site.email}`} className="text-base normal-case tracking-normal hover:underline">
                {site.email}
              </a>
            </div>
            <div>
              <p className="mb-2 font-mono text-muted">[Social]</p>
              <ul className="space-y-1">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} className="inline-flex min-h-6 items-center gap-1 hover:underline">
                      {s.label} <Arrow />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-muted">[Location]</p>
              <p className="whitespace-pre-line">{site.location}</p>
            </div>
          </div>
        </aside>
        <div className="lg:col-span-7 lg:col-start-6">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
