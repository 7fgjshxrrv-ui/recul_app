import type { TradeStat, WinRateResult } from "./types";

const BREAKEVEN_THRESHOLD = 0.0001;

export function calcWinRate(trades: TradeStat[]): WinRateResult {
  if (trades.length === 0) {
    return { total: 0, wins: 0, losses: 0, breakeven: 0, winRate: 0 };
  }

  let wins = 0;
  let losses = 0;
  let breakeven = 0;

  for (const t of trades) {
    const net = t.pnl - t.fees;
    if (net > BREAKEVEN_THRESHOLD) wins++;
    else if (net < -BREAKEVEN_THRESHOLD) losses++;
    else breakeven++;
  }

  return {
    total: trades.length,
    wins,
    losses,
    breakeven,
    winRate: trades.length > 0 ? wins / trades.length : 0,
  };
}
