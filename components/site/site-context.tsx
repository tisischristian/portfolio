"use client";

import { createContext, useContext } from "react";
import { defaults, type SiteConfig } from "@/lib/site";

const Ctx = createContext<SiteConfig>(defaults);

export function SiteProvider({ site, children }: { site: SiteConfig; children: React.ReactNode }) {
  return <Ctx.Provider value={site}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
