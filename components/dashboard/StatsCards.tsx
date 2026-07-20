import type { StatsResult } from "@/lib/stats";

function Card({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "alert" | "neutral";
}) {
  const color =
    tone === "positive"
      ? "text-[var(--positive)]"
      : tone === "alert"
      ? "text-[var(--alert)]"
      : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-grotesk uppercase tracking-wider opacity-60">{label}</p>
      <p className={`mt-3 text-3xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function StatsCards({ stats }: { stats: StatsResult }) {
  const pnlTone = stats.totalPnl > 0 ? "positive" : stats.totalPnl < 0 ? "alert" : "neutral";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        label="Win rate"
        value={`${Math.round(stats.winRate.winRate * 1000) / 10}%`}
      />
      <Card
        label="PnL total"
        value={`${stats.totalPnl > 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}`}
        tone={pnlTone}
      />
      <Card
        label="Max drawdown"
        value={stats.drawdown.maxDrawdown.toFixed(2)}
        tone={stats.drawdown.maxDrawdown < 0 ? "alert" : "neutral"}
      />
      <Card label="Trades" value={String(stats.winRate.total)} />
    </div>
  );
}
