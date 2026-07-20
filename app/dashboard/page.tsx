import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { getTradesForUser } from "@/lib/db/queries";
import { calcAllStats } from "@/lib/stats";
import StatsCards from "@/components/dashboard/StatsCards";
import EquityCurveChart from "@/components/dashboard/EquityCurveChart";
import HourHeatmap from "@/components/dashboard/HourHeatmap";
import SetupPerformance from "@/components/dashboard/SetupPerformance";

// Provisoire — remplacé par l'utilisateur Clerk authentifié
const DEMO_EMAIL = "demo@recul.app";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [user] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
  const trades = user ? await getTradesForUser(user.id) : [];
  const stats = calcAllStats(trades);
  const hasSetups = stats.bySetup.some((s) => s.setup !== "Sans tag");

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <a href="/" className="text-2xl font-grotesk font-bold text-[var(--accent)]">
          Recul.
        </a>
        <a
          href="/import"
          className="text-sm font-grotesk opacity-60 hover:opacity-100 transition-opacity"
        >
          + Importer des trades
        </a>
      </div>

      <h1 className="text-3xl font-grotesk font-bold mb-8">Dashboard</h1>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg font-grotesk opacity-70">Aucun trade importé pour l&apos;instant.</p>
          <a
            href="/import"
            className="px-6 py-3 rounded-pill bg-[var(--accent)] font-grotesk font-semibold text-sm text-black hover:opacity-90 transition-opacity"
          >
            Importer mes trades →
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <StatsCards stats={stats} />
          <EquityCurveChart data={stats.equityCurve} />
          <div className="grid md:grid-cols-2 gap-6">
            <HourHeatmap data={stats.byHour} />
            {hasSetups && <SetupPerformance data={stats.bySetup} />}
          </div>
        </div>
      )}
    </main>
  );
}
