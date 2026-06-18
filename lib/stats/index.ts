import type { TradeStat, StatsResult } from "./types";
import { calcWinRate } from "./winRate";
import { calcRMultiple } from "./rMultiple";
import { calcDrawdown, calcEquityCurve } from "./drawdown";
import { calcByHour, calcByDay, calcBySetup } from "./aggregates";

export * from "./types";
export { calcWinRate } from "./winRate";
export { calcRMultiple } from "./rMultiple";
export { calcDrawdown, calcEquityCurve } from "./drawdown";
export { calcByHour, calcByDay, calcBySetup } from "./aggregates";

const BREAKEVEN = 0.0001;

export function calcAllStats(
  trades: TradeStat[],
  startingCapital = 0
): StatsResult {
  const nets = trades.map((t) => t.pnl - t.fees);
  const totalPnl = nets.reduce((a, b) => a + b, 0);
  const avgPnl = trades.length > 0 ? totalPnl / trades.length : 0;

  const wins = nets.filter((n) => n > BREAKEVEN);
  const losses = nets.filter((n) => n < -BREAKEVEN);

  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;

  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Séries consécutives
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let curWin = 0;
  let curLoss = 0;

  const sorted = [...trades].sort(
    (a, b) => a.exitTime.getTime() - b.exitTime.getTime()
  );

  for (const t of sorted) {
    const net = t.pnl - t.fees;
    if (net > BREAKEVEN) {
      curWin++;
      curLoss = 0;
      longestWinStreak = Math.max(longestWinStreak, curWin);
    } else if (net < -BREAKEVEN) {
      curLoss++;
      curWin = 0;
      longestLossStreak = Math.max(longestLossStreak, curLoss);
    }
  }

  return {
    winRate: calcWinRate(trades),
    rMultiple: calcRMultiple(trades),
    drawdown: calcDrawdown(trades, startingCapital),
    equityCurve: calcEquityCurve(trades, startingCapital),
    byHour: calcByHour(trades),
    byDay: calcByDay(trades),
    bySetup: calcBySetup(trades),
    totalPnl: Math.round(totalPnl * 100) / 100,
    avgPnl: Math.round(avgPnl * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    longestWinStreak,
    longestLossStreak,
  };
}
