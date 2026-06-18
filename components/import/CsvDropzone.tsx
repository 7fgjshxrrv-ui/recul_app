"use client";

import { useState, useCallback, useRef } from "react";

interface Props {
  onParsed: (headers: string[], rows: string[][], raw: string) => void;
}

export default function CsvDropzone({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback(
    (text: string, name: string) => {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1, 6).map((l) =>
        l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      );
      setFileName(name);
      onParsed(headers, rows, text);
    },
    [onParsed]
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string, file.name);
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors
        ${dragging
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-white/20 hover:border-[var(--accent)]/60 hover:bg-white/5"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {fileName ? (
        <p className="text-sm font-mono text-[var(--accent)]">{fileName}</p>
      ) : (
        <>
          <p className="font-grotesk font-semibold">Déposez votre fichier CSV ici</p>
          <p className="text-sm opacity-50">ou cliquez pour parcourir</p>
        </>
      )}
    </div>
  );
}
