"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

interface PasswordItem {
  password: string;
  entropy_bits: number;
  strength: "weak" | "fair" | "good" | "strong" | "excellent";
}
interface PasswordResponse {
  passwords: PasswordItem[];
}

const strengthColor: Record<PasswordItem["strength"], string> = {
  weak: "bg-danger-500",
  fair: "bg-warn-500",
  good: "bg-brand-500",
  strong: "bg-accent-500",
  excellent: "bg-accent-600",
};

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(1);

  const [results, setResults] = useState<PasswordItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<PasswordResponse>("/password/generate", {
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        exclude_ambiguous: excludeAmbiguous,
        count,
      });
      setResults(res.passwords);
    } catch (err) {
      setResults([]);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Password Generator" description="Cryptographically secure passwords, generated with Python's secrets module — never stored." />

      <ToolPanel title="Options" className="mb-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <label htmlFor="length" className="font-medium text-ink dark:text-slate-200">Length</label>
              <span className="font-mono text-ink-muted dark:text-slate-400">{length}</span>
            </div>
            <input
              id="length"
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <label htmlFor="count" className="font-medium text-ink dark:text-slate-200">How many</label>
              <span className="font-mono text-ink-muted dark:text-slate-400">{count}</span>
            </div>
            <input
              id="count"
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Checkbox label="Uppercase (A-Z)" checked={uppercase} onChange={setUppercase} />
          <Checkbox label="Lowercase (a-z)" checked={lowercase} onChange={setLowercase} />
          <Checkbox label="Numbers (0-9)" checked={numbers} onChange={setNumbers} />
          <Checkbox label="Symbols (!@#$…)" checked={symbols} onChange={setSymbols} />
          <Checkbox label="Exclude ambiguous (l, I, 1, O, 0)" checked={excludeAmbiguous} onChange={setExcludeAmbiguous} />
        </div>

        <button
          type="button"
          onClick={generate}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw size={14} />
          Generate
        </button>
      </ToolPanel>

      {loading && <LoadingState label="Generating…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && results.length > 0 && (
        <div className="space-y-2.5">
          {results.map((r, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface-subtle px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-mono text-sm text-ink dark:text-slate-100">{r.password}</p>
                <CopyButton value={r.password} className="shrink-0" />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${strengthColor[r.strength]}`}
                    style={{ width: `${Math.min(100, (r.entropy_bits / 120) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs capitalize text-ink-faint dark:text-slate-500">{r.strength}</span>
                <span className="w-20 shrink-0 text-right font-mono text-xs text-ink-faint dark:text-slate-500">
                  {r.entropy_bits} bits
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-ink-muted dark:text-slate-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border accent-brand-600 dark:border-slate-700"
      />
      {label}
    </label>
  );
}
