"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { publicClient } from "@/lib/supabase/public";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<"name" | "email" | "body", string>>;
  /** Echoed back so React 19's post-action form reset doesn't wipe what was typed. */
  values?: Partial<Record<"name" | "email" | "interest" | "budget" | "body", string>>;
};

const echo = (form: FormData): ContactState["values"] => ({
  name: String(form.get("name") ?? ""),
  email: String(form.get("email") ?? ""),
  interest: String(form.get("interest") ?? "design"),
  budget: String(form.get("budget") ?? ""),
  body: String(form.get("body") ?? ""),
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().email("Please use a valid email").max(254),
  interest: z.enum(["design", "data", "both"]),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  body: z.string().trim().min(10, "A little more detail, please (10+ characters)").max(5000),
});

// Best-effort in-memory limiter: 3 messages / 10 min per IP per server instance.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 3;
}

async function notify(d: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: d.email,
      subject: `New ${d.interest} enquiry from ${d.name}`,
      text: `${d.name} <${d.email}>\nInterest: ${d.interest}\nBudget: ${d.budget || "—"}\n\n${d.body}`,
    }),
  }).catch((e) => console.error("[contact] email failed", e));
}

export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real people never fill this hidden field.
  if (form.get("company")) return { status: "ok" };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { name: f.name?.[0], email: f.email?.[0], body: f.body?.[0] },
      values: echo(form),
    };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (limited(ip))
    return { status: "error", message: "Too many messages — please try again in a few minutes.", values: echo(form) };

  const sb = publicClient();
  if (!sb) return { status: "error", message: "The form isn't connected yet. Please email me directly.", values: echo(form) };

  const d = parsed.data;
  const { error } = await sb.from("messages").insert({
    name: d.name,
    email: d.email,
    interest: d.interest,
    budget: d.budget || null,
    body: d.body,
  });
  if (error) {
    console.error("[contact]", error.message);
    return { status: "error", message: "Something went wrong. Please email me directly.", values: echo(form) };
  }

  await notify(d);
  return { status: "ok", message: "Thanks — your message is in. I'll reply within two working days." };
}
