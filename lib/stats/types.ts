// Types partagés entre toutes les fonctions stats
export interface TradeStat {
  pnl: number;
  entryTime: Date;
  exitTime: Date;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  fees: number;
  setupTag?: string | null;
}

export interface WinRateResult {
  total: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number; // 0.0 – 1.0
}

export interface RMultipleResult {
  values: number[];
  mean: number;
  median: number;
  expectancy: number; // moyenne pondérée win/loss
}

export interface DrawdownResult {
  maxDrawdown: number;       // valeur absolue (négatif)
  maxDrawdownPct: number;    // % par rapport au pic
  peakEquity: number;
  troughEquity: number;
}

export interface EquityPoint {
  date: string; // ISO
  equity: number;
  tradeIndex: number;
}

export interface AggByHour {
  hour: number; // 0–23
  tradesCount: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

export interface AggByDay {
  dayOfWeek: number; // 0=Dimanche … 6=Samedi
  dayLabel: string;
  tradesCount: number;
  winRate: number;
  totalPnl: number;
}

export interface AggBySetup {
  setup: string;
  tradesCount: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  avgRMultiple: number;
}

export interface StatsResult {
  winRate: WinRateResult;
  rMultiple: RMultipleResult;
  drawdown: DrawdownResult;
  equityCurve: EquityPoint[];
  byHour: AggByHour[];
  byDay: AggByDay[];
  bySetup: AggBySetup[];
  totalPnl: number;
  avgPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  longestWinStreak: number;
  longestLossStreak: number;
}
