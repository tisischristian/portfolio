"use client";

import { useState } from "react";
import { Field, inputCls } from "./ui";

/** New + confirm password inputs with a show/hide switch. Values are read from the form by name. */
export function NewPasswordFields({ autoFocus = false }: { autoFocus?: boolean }) {
  const [show, setShow] = useState(false);
  const type = show ? "text" : "password";
  return (
    <div className="space-y-6">
      <Field label="New password" hint="Must follow the password rules set for this site. If it doesn't, you'll see exactly what to change.">
        <input name="new_password" type={type} required autoComplete="new-password" autoFocus={autoFocus} className={inputCls} />
      </Field>
      <Field label="Confirm new password">
        <input name="confirm_password" type={type} required autoComplete="new-password" className={inputCls} />
      </Field>
      <label className="micro flex items-center gap-2 text-muted">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4" />
        Show passwords
      </label>
    </div>
  );
}

export function Problems({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <ul role="alert" className="micro space-y-1.5 font-mono normal-case">
      {lines.map((l) => (
        <li key={l}>✕ {l}</li>
      ))}
    </ul>
  );
}
