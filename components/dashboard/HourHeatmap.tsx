import type { AggByHour } from "@/lib/stats";

export default function HourHeatmap({ data }: { data: AggByHour[] }) {
  const byHour = new Map(data.map((h) => [h.hour, h]));
  const maxTrades = Math.max(1, ...data.map((h) => h.tradesCount));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-grotesk uppercase tracking-wider opacity-60 mb-4">
        Win rate par heure
      </p>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {Array.from({ length: 24 }, (_, hour) => {
          const h = byHour.get(hour);
          const intensity = h ? 0.25 + 0.75 * (h.tradesCount / maxTrades) : 0;
          const color = !h
            ? "transparent"
            : h.winRate >= 0.5
            ? `rgba(95, 193, 166, ${intensity})` // teal
            : `rgba(226, 133, 95, ${intensity})`; // rust

          return (
            <div
              key={hour}
              title={
                h
                  ? `${hour}h — ${Math.round(h.winRate * 100)}% win rate, ${h.tradesCount} trades, ${h.totalPnl.toFixed(2)}`
                  : `${hour}h — aucun trade`
              }
              className="aspect-square rounded-lg border border-white/10 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span className="text-[10px] font-mono opacity-60">{hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
