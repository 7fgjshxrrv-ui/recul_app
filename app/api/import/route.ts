import { NextRequest, NextResponse } from "next/server";
import { db, trades, brokerAccounts, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { Mapping } from "@/components/import/ColumnMapper";

function parseDate(val: string): Date {
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  // Formats alternatifs : DD/MM/YYYY HH:mm
  const parts = val.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (parts) {
    return new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:00`);
  }
  throw new Error(`Date invalide : ${val}`);
}

function parseNum(val: string): string {
  return val.replace(/[^\d.-]/g, "") || "0";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      csvRaw: string;
      mapping: Mapping;
      brokerName: string;
      currency: string;
      userEmail: string; // provisoire avant Clerk
    };

    const { csvRaw, mapping, brokerName, currency, userEmail } = body;

    // Résoudre ou créer l'utilisateur (provisoire — sera remplacé par Clerk)
    let [user] = await db.select().from(users).where(eq(users.email, userEmail));
    if (!user) {
      [user] = await db.insert(users).values({ email: userEmail }).returning();
    }

    // Résoudre ou créer le broker account + sauvegarder le mapping
    let [account] = await db
      .select()
      .from(brokerAccounts)
      .where(eq(brokerAccounts.userId, user.id));

    if (!account) {
      [account] = await db
        .insert(brokerAccounts)
        .values({ userId: user.id, brokerName, currency, columnMapping: mapping })
        .returning();
    } else {
      await db
        .update(brokerAccounts)
        .set({ columnMapping: mapping })
        .where(eq(brokerAccounts.id, account.id));
    }

    // Parser le CSV
    const lines = csvRaw.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const dataRows = lines.slice(1);

    const toInsert = dataRows
      .filter((l) => l.trim())
      .map((line) => {
        const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const get = (key: keyof Mapping) => {
          const col = mapping[key];
          if (!col) return "";
          const idx = headers.indexOf(col);
          return idx >= 0 ? cells[idx] : "";
        };

        const rawRow: Record<string, string> = {};
        headers.forEach((h, i) => { rawRow[h] = cells[i]; });

        return {
          userId: user.id,
          brokerAccountId: account.id,
          symbol: get("symbol"),
          side: get("side").toLowerCase().includes("short") ? "short" : "long",
          entryTime: parseDate(get("entry_time")),
          exitTime: parseDate(get("exit_time")),
          entryPrice: parseNum(get("entry_price")),
          exitPrice: parseNum(get("exit_price")),
          quantity: parseNum(get("quantity")),
          pnl: parseNum(get("pnl")),
          fees: parseNum(get("fees")),
          setupTag: get("setup_tag") || null,
          rawRowJson: rawRow,
        };
      });

    await db.insert(trades).values(toInsert);

    return NextResponse.json({ inserted: toInsert.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
