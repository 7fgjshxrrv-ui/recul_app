import type { TradeStat, RMultipleResult } from "./types";

// R = PnL net / |perte moyenne des trades perdants|
// Si aucune perte, R est calculé par rapport à la mise moyenne
export function calcRMultiple(trades: TradeStat[]): RMultipleResult {
  if (trades.length === 0) {
    return { values: [], mean: 0, median: 0, expectancy: 0 };
  }

  const nets = trades.map((t) => t.pnl - t.fees);
  const losses = nets.filter((n) => n < 0);
  const avgLoss = losses.length > 0
    ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
    : 1; // fallback évite division par zéro

  const values = nets.map((n) => (avgLoss > 0 ? n / avgLoss : 0));

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  // Expectancy = winRate * avgWin_R - lossRate * 1
  const winValues = values.filter((v) => v > 0);
  const lossValues = values.filter((v) => v <= 0);
  const winRate = winValues.length / values.length;
  const avgWinR = winValues.length > 0
    ? winValues.reduce((a, b) => a + b, 0) / winValues.length
    : 0;
  const avgLossR = lossValues.length > 0
    ? Math.abs(lossValues.reduce((a, b) => a + b, 0) / lossValues.length)
    : 0;
  const expectancy = winRate * avgWinR - (1 - winRate) * avgLossR;

  return { values, mean, median, expectancy };
}
