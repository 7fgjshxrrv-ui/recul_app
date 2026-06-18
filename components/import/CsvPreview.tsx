"use client";

interface Props {
  headers: string[];
  rows: string[][];
}

export default function CsvPreview({ headers, rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 text-left text-[var(--accent)] font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 whitespace-nowrap opacity-80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs opacity-40 border-t border-white/5">
        Aperçu des 5 premières lignes
      </p>
    </div>
  );
}
