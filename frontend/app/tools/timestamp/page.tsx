"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface TimestampResponse {
  unix_seconds: number;
  unix_milliseconds: number;
  iso_utc: string;
  human_utc: string;
}

export default function TimestampPage() {
  const [value, setValue] = useState("");
  const [direction, setDirection] = useState<"to_date" | "to_timestamp">("to_date");
  const [result, setResult] = useState<TimestampResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!value.trim()) return;
    try {
      const res = await apiPost<TimestampResponse>("/timestamp/convert", { value: value.trim(), direction, unit: "seconds" });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  function useNow() {
    setValue(direction === "to_date" ? String(Math.floor(Date.now() / 1000)) : new Date().toISOString());
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="Timestamp Converter" description="Convert between Unix timestamps and human-readable UTC dates." />

      <ToolPanel title="Convert" className="mb-4">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("to_date")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${direction === "to_date" ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400"}`}
          >
            Timestamp → Date
          </button>
          <button
            type="button"
            onClick={() => setDirection("to_timestamp")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${direction === "to_timestamp" ? "border-brand-600 bg-brand-600 text-white" : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400"}`}
          >
            Date → Timestamp
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={direction === "to_date" ? "1700000000" : "2026-08-20T14:30:00Z"}
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={useNow} className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900">
            Now
          </button>
          <button type="button" onClick={run} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Convert
          </button>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title="Result">
          <dl className="space-y-2.5 text-sm">
            <Row label="Unix (seconds)" value={String(result.unix_seconds)} />
            <Row label="Unix (milliseconds)" value={String(result.unix_milliseconds)} />
            <Row label="ISO 8601 (UTC)" value={result.iso_utc} />
            <Row label="Human-readable (UTC)" value={result.human_utc} />
          </dl>
        </ToolPanel>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-faint dark:text-slate-500">{label}</dt>
      <div className="flex items-center gap-2">
        <dd className="font-mono text-ink dark:text-slate-200">{value}</dd>
        <CopyButton value={value} className="px-2 py-1" />
      </div>
    </div>
  );
}