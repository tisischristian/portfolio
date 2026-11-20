"use client";

import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { Block } from "@/lib/types";

type ChartBlock = Extract<Block, { type: "chart" }>;

// Monochrome series styles: separated by stroke pattern + opacity, never hue.
const styles = [
  { opacity: 1, dash: undefined, fill: 0.9 },
  { opacity: 0.55, dash: "6 4", fill: 0.35 },
  { opacity: 0.35, dash: "2 3", fill: 0.15 },
];

function Tip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-fg bg-bg px-3 py-2 font-mono text-xs text-fg">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function MonoChart({ block }: { block: ChartBlock }) {
  const [table, setTable] = useState(false);
  const id = useId();
  const { kind, data, xKey, series } = block;

  const axis = {
    stroke: "currentColor",
    strokeOpacity: 0.3,
    tick: { fill: "currentColor", fontSize: 11, fontFamily: "var(--font-mono)" },
    tickLine: false,
  } as const;
  const common = (
    <>
      <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
      <XAxis dataKey={xKey} {...axis} />
      <YAxis {...axis} width={40} axisLine={false} />
      <Tooltip content={<Tip />} cursor={{ stroke: "currentColor", strokeOpacity: 0.2, fill: "currentColor", fillOpacity: 0.05 }} />
    </>
  );

  return (
    <figure className="border border-line" aria-labelledby={`${id}-t`}>
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <p id={`${id}-t`} className="micro font-mono">
          {block.title ?? "Chart"}
        </p>
        <div className="flex items-center gap-5">
          {series.length > 1 && (
            <ul className="micro hidden gap-4 font-mono sm:flex" aria-label="Legend">
              {series.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <svg width="20" height="6" aria-hidden>
                    <line x1="0" y1="3" x2="20" y2="3" stroke="currentColor" strokeWidth="2" strokeOpacity={styles[i % 3].opacity} strokeDasharray={styles[i % 3].dash} />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setTable((v) => !v)}
            aria-pressed={table}
            className="micro font-mono underline-offset-4 hover:underline"
          >
            [{table ? "chart" : "data table"}]
          </button>
        </div>
      </div>

      {table ? (
        <div className="overflow-x-auto p-5">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2 pr-4 font-normal">{xKey}</th>
                {series.map((s) => (
                  <th key={s} className="py-2 pr-4 text-right font-normal">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-2 pr-4">{row[xKey]}</td>
                  {series.map((s) => (
                    <td key={s} className="py-2 pr-4 text-right">
                      {row[s]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-[clamp(240px,40vw,420px)] p-3 pt-6 text-fg sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "bar" ? (
              <BarChart data={data}>
                {common}
                {series.map((s, i) => (
                  <Bar key={s} dataKey={s} fill="currentColor" fillOpacity={styles[i % 3].fill} stroke="currentColor" strokeOpacity={styles[i % 3].opacity} />
                ))}
              </BarChart>
            ) : kind === "area" ? (
              <AreaChart data={data}>
                {common}
                {series.map((s, i) => (
                  <Area
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeOpacity={styles[i % 3].opacity}
                    strokeDasharray={styles[i % 3].dash}
                    fill="currentColor"
                    fillOpacity={i === 0 ? 0.12 : 0}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data}>
                {common}
                {series.map((s, i) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeOpacity={styles[i % 3].opacity}
                    strokeDasharray={styles[i % 3].dash}
                    dot={{ r: 3, fill: "currentColor", fillOpacity: styles[i % 3].opacity }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      {block.caption && <figcaption className="micro border-t border-line px-5 py-3 text-muted">{block.caption}</figcaption>}
    </figure>
  );
}
