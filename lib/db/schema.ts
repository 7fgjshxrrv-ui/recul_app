import { pgTable, uuid, text, timestamp, integer, numeric, jsonb, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brokerAccounts = pgTable("broker_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  brokerName: text("broker_name").notNull(),
  currency: text("currency").notNull().default("USD"),
  // Mapping de colonnes CSV sauvegardé par broker pour réutilisation
  columnMapping: jsonb("column_mapping"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  brokerAccountId: uuid("broker_account_id")
    .notNull()
    .references(() => brokerAccounts.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // "long" | "short"
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time").notNull(),
  entryPrice: numeric("entry_price", { precision: 20, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 20, scale: 8 }).notNull(),
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  pnl: numeric("pnl", { precision: 20, scale: 8 }).notNull(),
  fees: numeric("fees", { precision: 20, scale: 8 }).default("0"),
  setupTag: text("setup_tag"),
  rawRowJson: jsonb("raw_row_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO date string "YYYY-MM-DD"
  tradesCount: integer("trades_count").notNull().default(0),
  winRate: real("win_rate"),       // 0.0 – 1.0, calculé en SQL
  totalPnl: numeric("total_pnl", { precision: 20, scale: 8 }),
  maxDrawdown: numeric("max_drawdown", { precision: 20, scale: 8 }),
});

export const patternsDetected = pgTable("patterns_detected", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  patternType: text("pattern_type").notNull(),
  description: text("description").notNull(),
  confidence: real("confidence"),  // 0.0 – 1.0
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  evidenceJson: jsonb("evidence_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  summaryText: text("summary_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types inférés pour usage dans l'app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BrokerAccount = typeof brokerAccounts.$inferSelect;
export type NewBrokerAccount = typeof brokerAccounts.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type DailyStat = typeof dailyStats.$inferSelect;
export type PatternDetected = typeof patternsDetected.$inferSelect;
export type Report = typeof reports.$inferSelect;
