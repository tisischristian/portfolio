"use client";

import dynamic from "next/dynamic";
import type { Block } from "@/lib/types";

type ChartBlock = Extract<Block, { type: "chart" }>;

/**
 * Loads recharts only on pages that actually contain a chart (it's ~140 kB).
 * The placeholder matches the chart's frame so nothing shifts when it arrives.
 */
const MonoChart = dynamic(() => import("./mono-chart").then((m) => m.MonoChart), {
  ssr: false,
  loading: () => (
    <div className="border border-line" aria-busy="true">
      <div className="h-[46px] border-b border-line" />
      <div className="h-[clamp(240px,40vw,420px)]" />
    </div>
  ),
});

export function LazyChart({ block }: { block: ChartBlock }) {
  return <MonoChart block={block} />;
}
