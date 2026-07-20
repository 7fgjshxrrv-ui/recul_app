import type { AggBySetup } from "@/lib/stats";

export default function SetupPerformance({ data }: { data: AggBySetup[] }) {
  const maxAbsPnl = Math.max(1, ...data.map((s) => Math.abs(s.totalPnl)));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-grotesk uppercase tracking-wider opacity-60 mb-4">
        Performance par setup
      </p>
      <div className="space-y-3">
        {data.map((s) => {
          const barWidth = `${(Math.abs(s.totalPnl) / maxAbsPnl) * 100}%`;
          const tone = s.totalPnl >= 0 ? "var(--positive)" : "var(--alert)";

          return (
            <div key={s.setup} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-grotesk">
                <span>{s.setup}</span>
                <span className="font-mono opacity-70">
                  {Math.round(s.winRate * 100)}% · {s.tradesCount} trades
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: barWidth, backgroundColor: tone }}
                />
              </div>
              <p className="text-xs font-mono opacity-50">
                {s.totalPnl > 0 ? "+" : ""}
                {s.totalPnl.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
