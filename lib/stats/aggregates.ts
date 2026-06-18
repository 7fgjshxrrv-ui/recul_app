import type { TradeStat, AggByHour, AggByDay, AggBySetup } from "./types";
import { calcRMultiple } from "./rMultiple";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const BREAKEVEN = 0.0001;

function groupBy<T>(items: T[], key: (item: T) => string | number): Map<string | number, T[]> {
  const map = new Map<string | number, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = map.get(k) ?? [];
    arr.push(item);
    map.set(k, arr);
  }
  return map;
}

export function calcByHour(trades: TradeStat[]): AggByHour[] {
  const byHour = groupBy(trades, (t) => t.entryTime.getUTCHours());
  const result: AggByHour[] = [];

  for (let h = 0; h < 24; h++) {
    const group = byHour.get(h) ?? [];
    if (group.length === 0) continue;
    const wins = group.filter((t) => t.pnl - t.fees > BREAKEVEN).length;
    const totalPnl = group.reduce((s, t) => s + t.pnl - t.fees, 0);
    result.push({
      hour: h,
      tradesCount: group.length,
      winRate: wins / group.length,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgPnl: Math.round((totalPnl / group.length) * 100) / 100,
    });
  }
  return result;
}

export function calcByDay(trades: TradeStat[]): AggByDay[] {
  const byDay = groupBy(trades, (t) => t.entryTime.getUTCDay());
  const result: AggByDay[] = [];

  for (let d = 0; d < 7; d++) {
    const group = byDay.get(d) ?? [];
    if (group.length === 0) continue;
    const wins = group.filter((t) => t.pnl - t.fees > BREAKEVEN).length;
    const totalPnl = group.reduce((s, t) => s + t.pnl - t.fees, 0);
    result.push({
      dayOfWeek: d,
      dayLabel: DAY_LABELS[d],
      tradesCount: group.length,
      winRate: wins / group.length,
      totalPnl: Math.round(totalPnl * 100) / 100,
    });
  }
  return result;
}

export function calcBySetup(trades: TradeStat[]): AggBySetup[] {
  const bySetup = groupBy(trades, (t) => t.setupTag ?? "Sans tag");
  const result: AggBySetup[] = [];

  for (const [setup, group] of Array.from(bySetup.entries())) {
    const wins = group.filter((t: TradeStat) => t.pnl - t.fees > BREAKEVEN).length;
    const totalPnl = group.reduce((s: number, t: TradeStat) => s + t.pnl - t.fees, 0);
    const rResult = calcRMultiple(group);
    result.push({
      setup: String(setup),
      tradesCount: group.length,
      winRate: wins / group.length,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgPnl: Math.round((totalPnl / group.length) * 100) / 100,
      avgRMultiple: Math.round(rResult.mean * 100) / 100,
    });
  }

  return result.sort((a, b) => b.totalPnl - a.totalPnl);
}
