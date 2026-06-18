import { describe, it, expect } from "vitest";
import type { TradeStat } from "../types";
import { calcWinRate } from "../winRate";
import { calcRMultiple } from "../rMultiple";
import { calcDrawdown, calcEquityCurve } from "../drawdown";
import { calcByHour, calcBySetup } from "../aggregates";
import { calcAllStats } from "../index";

const d = (iso: string) => new Date(iso);

const TRADES: TradeStat[] = [
  { pnl: 100, fees: 5,  entryTime: d("2024-01-15T09:00:00Z"), exitTime: d("2024-01-15T09:30:00Z"), symbol: "EURUSD", side: "long",  quantity: 1, entryPrice: 1.09, exitPrice: 1.10, setupTag: "breakout" },
  { pnl: -50, fees: 5,  entryTime: d("2024-01-15T10:00:00Z"), exitTime: d("2024-01-15T10:30:00Z"), symbol: "EURUSD", side: "short", quantity: 1, entryPrice: 1.10, exitPrice: 1.105, setupTag: "breakout" },
  { pnl: 200, fees: 10, entryTime: d("2024-01-16T14:00:00Z"), exitTime: d("2024-01-16T14:45:00Z"), symbol: "GBPUSD", side: "long",  quantity: 2, entryPrice: 1.26, exitPrice: 1.27, setupTag: "trend" },
  { pnl: -30, fees: 5,  entryTime: d("2024-01-16T15:00:00Z"), exitTime: d("2024-01-16T15:20:00Z"), symbol: "GBPUSD", side: "long",  quantity: 1, entryPrice: 1.27, exitPrice: 1.267, setupTag: null },
  { pnl: 80,  fees: 5,  entryTime: d("2024-01-17T09:30:00Z"), exitTime: d("2024-01-17T10:00:00Z"), symbol: "EURUSD", side: "long",  quantity: 1, entryPrice: 1.09, exitPrice: 1.098, setupTag: "trend" },
];

describe("calcWinRate", () => {
  it("compte les wins/losses correctement", () => {
    const r = calcWinRate(TRADES);
    expect(r.total).toBe(5);
    expect(r.wins).toBe(3);   // nets: 95, -55, 190, -35, 75
    expect(r.losses).toBe(2);
    expect(r.winRate).toBeCloseTo(0.6);
  });

  it("retourne 0 sur tableau vide", () => {
    expect(calcWinRate([]).winRate).toBe(0);
  });
});

describe("calcRMultiple", () => {
  it("calcule un R mean et expectancy cohérents", () => {
    const r = calcRMultiple(TRADES);
    expect(r.values).toHaveLength(5);
    expect(r.mean).toBeGreaterThan(0); // plus de gains que pertes
    expect(r.expectancy).toBeGreaterThan(0);
  });

  it("median est entre min et max", () => {
    const r = calcRMultiple(TRADES);
    const min = Math.min(...r.values);
    const max = Math.max(...r.values);
    expect(r.median).toBeGreaterThanOrEqual(min);
    expect(r.median).toBeLessThanOrEqual(max);
  });
});

describe("calcEquityCurve", () => {
  it("produit autant de points que de trades", () => {
    const curve = calcEquityCurve(TRADES, 1000);
    expect(curve).toHaveLength(5);
  });

  it("equity finale = capital initial + somme des PnL nets", () => {
    const netTotal = TRADES.reduce((s, t) => s + t.pnl - t.fees, 0);
    const curve = calcEquityCurve(TRADES, 1000);
    expect(curve[curve.length - 1].equity).toBeCloseTo(1000 + netTotal);
  });
});

describe("calcDrawdown", () => {
  it("drawdown est négatif ou nul", () => {
    const r = calcDrawdown(TRADES, 1000);
    expect(r.maxDrawdown).toBeLessThanOrEqual(0);
  });

  it("drawdown est 0 si tous les trades sont gagnants", () => {
    const allWins: TradeStat[] = TRADES.filter((t) => t.pnl > 0);
    const r = calcDrawdown(allWins, 0);
    expect(r.maxDrawdown).toBe(0);
  });
});

describe("calcByHour", () => {
  it("groupe par heure UTC d'entrée", () => {
    const r = calcByHour(TRADES);
    const hours = r.map((x) => x.hour);
    expect(hours).toContain(9);
    expect(hours).toContain(10);
    expect(hours).toContain(14);
  });

  it("totalPnl par heure est cohérent", () => {
    const r = calcByHour(TRADES);
    const h9 = r.find((x) => x.hour === 9);
    // Trades à 9h : pnl=100-5=95 et pnl=80-5=75 → total=170
    expect(h9?.totalPnl).toBeCloseTo(170);
  });
});

describe("calcBySetup", () => {
  it("regroupe par setup_tag", () => {
    const r = calcBySetup(TRADES);
    const setups = r.map((x) => x.setup);
    expect(setups).toContain("breakout");
    expect(setups).toContain("trend");
    expect(setups).toContain("Sans tag");
  });

  it("trie par totalPnl décroissant", () => {
    const r = calcBySetup(TRADES);
    for (let i = 0; i < r.length - 1; i++) {
      expect(r[i].totalPnl).toBeGreaterThanOrEqual(r[i + 1].totalPnl);
    }
  });
});

describe("calcAllStats", () => {
  it("produit un résultat complet cohérent", () => {
    const s = calcAllStats(TRADES, 1000);
    expect(s.winRate.winRate).toBeCloseTo(0.6);
    expect(s.profitFactor).toBeGreaterThan(1);
    expect(s.longestWinStreak).toBeGreaterThanOrEqual(1);
    expect(s.equityCurve).toHaveLength(5);
  });
});
