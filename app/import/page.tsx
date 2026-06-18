"use client";

import { useState, useCallback } from "react";
import CsvDropzone from "@/components/import/CsvDropzone";
import CsvPreview from "@/components/import/CsvPreview";
import ColumnMapper, { type Mapping, REQUIRED_FIELDS } from "@/components/import/ColumnMapper";

type Step = "upload" | "map" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [csvRaw, setCsvRaw] = useState("");
  const [mapping, setMapping] = useState<Mapping>({});
  const [brokerName, setBrokerName] = useState("Mon broker");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParsed = useCallback(
    (h: string[], rows: string[][], raw: string) => {
      setHeaders(h);
      setPreviewRows(rows);
      setCsvRaw(raw);
      // Auto-mapping par similarité de nom
      const autoMap: Mapping = {};
      for (const { key } of REQUIRED_FIELDS) {
        const match = h.find(
          (col) =>
            col.toLowerCase().replace(/[^a-z]/g, "").includes(key.replace(/_/g, "")) ||
            key.replace(/_/g, "").includes(col.toLowerCase().replace(/[^a-z]/g, ""))
        );
        if (match) (autoMap as Record<string, string>)[key] = match;
      }
      setMapping(autoMap);
      setStep("map");
    },
    []
  );

  const requiredMapped = REQUIRED_FIELDS.filter((f) => f.required).every(
    (f) => mapping[f.key]
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvRaw,
          mapping,
          brokerName,
          currency,
          userEmail: "demo@recul.app", // remplacé par Clerk à l'étape auth
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-10">
        <a href="/" className="text-2xl font-grotesk font-bold text-[var(--accent)]">
          Recul.
        </a>
        <h1 className="mt-6 text-3xl font-grotesk font-bold">Importer des trades</h1>
        <p className="mt-2 opacity-60 text-sm">
          Exportez l'historique de vos trades depuis votre broker au format CSV, puis déposez-le ici.
        </p>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-3 mb-8 text-sm font-mono">
        {(["upload", "map", "done"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${step === s ? "text-[var(--accent)]" : "opacity-30"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                ${step === s ? "border-[var(--accent)] text-[var(--accent)]" : "border-current"}`}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">
                {s === "upload" ? "Fichier" : s === "map" ? "Mapping" : "Terminé"}
              </span>
            </div>
            {i < 2 && <span className="opacity-20">→</span>}
          </div>
        ))}
      </div>

      {/* Étape 1 : Upload */}
      {step === "upload" && (
        <CsvDropzone onParsed={handleParsed} />
      )}

      {/* Étape 2 : Mapping */}
      {step === "map" && (
        <div className="space-y-8">
          {/* Info broker */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono opacity-60">Nom du broker</label>
              <input
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm
                           focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono opacity-60">Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm
                           focus:outline-none focus:border-[var(--accent)] transition-colors"
              >
                {["USD", "EUR", "GBP", "CHF", "CAD", "AUD", "JPY"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <h3 className="font-grotesk font-semibold text-sm uppercase tracking-wider opacity-60">
              Aperçu du fichier
            </h3>
            <CsvPreview headers={headers} rows={previewRows} />
          </div>

          {/* Mapping */}
          <ColumnMapper headers={headers} mapping={mapping} onChange={setMapping} />

          {error && (
            <p className="text-sm font-mono text-[var(--alert)] bg-[var(--alert)]/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="px-6 py-3 rounded-pill border border-white/20 text-sm font-grotesk
                         hover:bg-white/5 transition-colors"
            >
              ← Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={!requiredMapped || loading}
              className="flex-1 px-6 py-3 rounded-pill bg-[var(--accent)] font-grotesk font-semibold text-sm
                         text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Import en cours…" : "Importer les trades →"}
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Succès */}
      {step === "done" && result && (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--positive)]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--positive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-grotesk font-bold">
              <span className="font-mono text-[var(--positive)]">{result.inserted}</span> trades importés
            </p>
            <p className="mt-2 opacity-60 text-sm">
              Le mapping a été sauvegardé pour vos prochains imports.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep("upload"); setResult(null); }}
              className="px-6 py-3 rounded-pill border border-white/20 text-sm font-grotesk
                         hover:bg-white/5 transition-colors"
            >
              Importer un autre fichier
            </button>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-pill bg-[var(--accent)] font-grotesk font-semibold text-sm
                         text-black hover:opacity-90 transition-opacity"
            >
              Voir le dashboard →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
