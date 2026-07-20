import { eq } from "drizzle-orm";
import { db, trades } from "./index";
import type { TradeStat } from "@/lib/stats";

export async function getTradesForUser(userId: string): Promise<TradeStat[]> {
  const rows = await db.select().from(trades).where(eq(trades.userId, userId));

  return rows.map((t) => ({
    pnl: Number(t.pnl),
    fees: Number(t.fees ?? 0),
    entryTime: t.entryTime,
    exitTime: t.exitTime,
    symbol: t.symbol,
    side: t.side as "long" | "short",
    quantity: Number(t.quantity),
    entryPrice: Number(t.entryPrice),
    exitPrice: Number(t.exitPrice),
    setupTag: t.setupTag,
  }));
}
