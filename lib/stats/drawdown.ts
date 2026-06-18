import type { TradeStat, DrawdownResult, EquityPoint } from "./types";

export function calcEquityCurve(
  trades: TradeStat[],
  startingCapital = 0
): EquityPoint[] {
  // Trier par date de sortie
  const sorted = [...trades].sort(
    (a, b) => a.exitTime.getTime() - b.exitTime.getTime()
  );

  let equity = startingCapital;
  return sorted.map((t, i) => {
    equity += t.pnl - t.fees;
    return {
      date: t.exitTime.toISOString().slice(0, 10),
      equity: Math.round(equity * 100) / 100,
      tradeIndex: i,
    };
  });
}

export function calcDrawdown(
  trades: TradeStat[],
  startingCapital = 0
): DrawdownResult {
  const curve = calcEquityCurve(trades, startingCapital);

  if (curve.length === 0) {
    return { maxDrawdown: 0, maxDrawdownPct: 0, peakEquity: 0, troughEquity: 0 };
  }

  let peak = startingCapital;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  let peakEquity = startingCapital;
  let troughEquity = startingCapital;

  for (const point of curve) {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const dd = point.equity - peak;
    if (dd < maxDrawdown) {
      maxDrawdown = dd;
      maxDrawdownPct = peak !== 0 ? dd / Math.abs(peak) : 0;
      peakEquity = peak;
      troughEquity = point.equity;
    }
  }

  return {
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPct: Math.round(maxDrawdownPct * 10000) / 10000,
    peakEquity: Math.round(peakEquity * 100) / 100,
    troughEquity: Math.round(troughEquity * 100) / 100,
  };
}
