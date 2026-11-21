"use client";

/**
 * Turns Supabase Auth errors from password changes into clear messages.
 *
 * The password rules themselves (minimum length, required characters, leaked-password check)
 * live in Supabase → Authentication → Providers → Email and are enforced by Supabase on every
 * password set. They aren't readable from the browser, so we never hard-code them here: we pass
 * Supabase's own explanation through, which always matches whatever is configured.
 */
type AuthErrorLike = { message?: string; code?: string; status?: number; reasons?: string[] } | null | undefined;

const REASONS: Record<string, string> = {
  length: "It's shorter than the minimum length set for this site.",
  characters: "It's missing a required type of character (for example a number, uppercase letter or symbol).",
  pwned: "This password has appeared in a known data breach. Choose a different one.",
};

export function describePasswordError(error: AuthErrorLike): string[] {
  if (!error) return [];
  const code = error.code ?? "";
  if (code === "weak_password" || (error.reasons && error.reasons.length)) {
    const lines = (error.reasons ?? []).map((r) => REASONS[r]).filter(Boolean) as string[];
    // Supabase's message spells out the exact rule, e.g. "Password should be at least 12 characters."
    if (error.message) lines.push(error.message);
    return lines.length ? Array.from(new Set(lines)) : ["That password doesn't meet the password rules."];
  }
  if (code === "same_password") return ["Your new password must be different from the current one."];
  if (code === "reauthentication_needed" || code === "reauth_nonce_missing")
    return ["For security, sign out and back in, then change your password again."];
  if (code === "invalid_credentials") return ["The current password is incorrect."];
  if (code === "over_email_send_rate_limit" || error.status === 429)
    return ["Too many attempts. Wait a minute and try again."];
  return [error.message || "Something went wrong. Try again."];
}

/** Checks we can do before asking Supabase (the real rules are enforced server-side). */
export function localPasswordProblems(next: string, confirm: string, current?: string): string[] {
  const out: string[] = [];
  if (!next) out.push("Enter a new password.");
  if (next && confirm !== next) out.push("The two new passwords don't match.");
  if (current !== undefined && next && current === next) out.push("Your new password must be different from the current one.");
  return out;
}
