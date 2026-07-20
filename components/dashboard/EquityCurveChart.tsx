"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { EquityPoint } from "@/lib/stats";

export default function EquityCurveChart({ data }: { data: EquityPoint[] }) {
  const last = data[data.length - 1]?.equity ?? 0;
  const first = data[0]?.equity ?? 0;
  const strokeColor = last >= first ? "var(--positive)" : "var(--alert)";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-grotesk uppercase tracking-wider opacity-60 mb-4">
        Courbe d&apos;équité
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fontFamily: "var(--font-space-mono)" }}
              stroke="currentColor"
              opacity={0.4}
              minTickGap={30}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-space-mono)" }}
              stroke="currentColor"
              opacity={0.4}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontFamily: "var(--font-space-mono)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
