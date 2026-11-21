"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/(site)/brief-me/actions";
import { Arrow } from "@/components/ui/arrow";

const field =
  "peer w-full border-b border-line-strong bg-transparent pt-7 pb-3 text-lg outline-none transition-colors placeholder:text-transparent focus:border-accent aria-[invalid=true]:border-accent";
const lbl =
  "micro pointer-events-none absolute top-1 left-0 text-muted transition-colors peer-focus:text-fg";

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p id={id} className="micro mt-2 font-mono">
      ✕ {msg}
    </p>
  ) : null;
}

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });

  if (state.status === "ok") {
    return (
      <div role="status" className="border border-line p-8 sm:p-12">
        <p className="micro font-mono text-muted">{"// Sent"}</p>
        <p className="mt-4 text-[length:var(--fs-h2)] leading-tight font-medium tracking-tight">
          {state.message ?? "Thanks — message received."}
        </p>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} noValidate className="space-y-10">
      {/* Spam trap. Not rendered at all (`hidden`) and given a name/label no autofill recognises —
          the old one was called "company", which phone autofill (Safari AutoFill Contact, Chrome
          address profiles) filled in, so real messages from phones were silently discarded. */}
      <div hidden aria-hidden>
        <label>
          Leave empty <input name="pf_hp_2b" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative">
          <input id="name" name="name" placeholder="Name" autoComplete="name" defaultValue={v.name} required aria-invalid={!!e.name} aria-describedby="name-err" className={field} />
          <label htmlFor="name" className={lbl}>Your name *</label>
          <Err id="name-err" msg={e.name} />
        </div>
        <div className="relative">
          <input id="email" name="email" type="email" placeholder="Email" autoComplete="email" defaultValue={v.email} required aria-invalid={!!e.email} aria-describedby="email-err" className={field} />
          <label htmlFor="email" className={lbl}>Email *</label>
          <Err id="email-err" msg={e.email} />
        </div>
      </div>

      <fieldset>
        <legend className="micro mb-4 text-muted">I&rsquo;m interested in *</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["design", "Design"],
            ["data", "Data"],
            ["both", "Both"],
          ].map(([value, l], i) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="interest" value={value} defaultChecked={v.interest ? v.interest === value : i === 0} className="peer sr-only" />
              <span className="micro inline-flex h-10 items-center rounded-full border border-line-strong px-5 transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                {l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative">
        <select id="budget" name="budget" defaultValue={v.budget ?? ""} className={`${field} cursor-pointer appearance-none`}>
          <option value="" className="bg-bg">Prefer not to say</option>
          <option className="bg-bg">Under $1K</option>
          <option className="bg-bg">$1K – $5K</option>
          <option className="bg-bg">$5K – $10K</option>
          <option className="bg-bg">$10K+</option>
        </select>
        <label htmlFor="budget" className={lbl}>Budget (optional)</label>
        <span aria-hidden className="pointer-events-none absolute right-0 bottom-4"><Arrow rotate={135} /></span>
      </div>

      <div className="relative">
        <textarea id="body" name="body" rows={5} placeholder="Message" defaultValue={v.body} required aria-invalid={!!e.body} aria-describedby="body-err" className={`${field} resize-y`} />
        <label htmlFor="body" className={lbl}>Tell me about the project *</label>
        <Err id="body-err" msg={e.body} />
      </div>

      <div className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="micro font-mono" aria-live="polite">
          {state.status === "error" && state.message}
        </p>
        <button
          type="submit"
          data-magnetic
          disabled={pending}
          className="micro inline-flex h-14 items-center gap-3 rounded-full bg-fg px-8 text-bg transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
        >
          {pending ? "Sending…" : <>Send message <Arrow /></>}
        </button>
      </div>
    </form>
  );
}
