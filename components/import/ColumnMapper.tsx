"use client";

export const REQUIRED_FIELDS = [
  { key: "symbol",      label: "Symbole",       required: true },
  { key: "side",        label: "Sens (Long/Short)", required: true },
  { key: "entry_time",  label: "Date/heure entrée", required: true },
  { key: "exit_time",   label: "Date/heure sortie", required: true },
  { key: "entry_price", label: "Prix d'entrée",  required: true },
  { key: "exit_price",  label: "Prix de sortie", required: true },
  { key: "quantity",    label: "Quantité",       required: true },
  { key: "pnl",         label: "PnL",            required: true },
  { key: "fees",        label: "Frais",          required: false },
  { key: "setup_tag",   label: "Setup / Tag",    required: false },
] as const;

export type FieldKey = (typeof REQUIRED_FIELDS)[number]["key"];
export type Mapping = Partial<Record<FieldKey, string>>;

interface Props {
  headers: string[];
  mapping: Mapping;
  onChange: (mapping: Mapping) => void;
}

export default function ColumnMapper({ headers, mapping, onChange }: Props) {
  const update = (key: FieldKey, value: string) =>
    onChange({ ...mapping, [key]: value || undefined });

  return (
    <div className="space-y-3">
      <h3 className="font-grotesk font-semibold text-sm uppercase tracking-wider opacity-60">
        Mapping des colonnes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REQUIRED_FIELDS.map(({ key, label, required }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-mono opacity-60">
              {label}
              {required && <span className="ml-1 text-[var(--accent)]">*</span>}
            </label>
            <select
              value={mapping[key] ?? ""}
              onChange={(e) => update(key, e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono
                         focus:outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="">— ignorer —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
