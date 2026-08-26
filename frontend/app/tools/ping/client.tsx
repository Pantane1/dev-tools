"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiGet, ApiError } from "@/lib/api";

interface PingAttempt {
  success: boolean;
  time_ms: number | null;
}
interface PingResponse {
  host: string;
  port: number;
  attempts: PingAttempt[];
  packet_loss_percent: number;
  min_ms: number | null;
  avg_ms: number | null;
  max_ms: number | null;
  method_note: string;
}

export default function PingPage() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("443");
  const [result, setResult] = useState<PingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!host.trim()) return;
    try {
      const res = await apiGet<PingResponse>("/ping/check", { host: host.trim(), port: port.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="Ping / Latency Checker" description="Measure round-trip TCP latency to a host over 4 attempts." />

      <ToolPanel title="Target" className="mb-4">
        <div className="flex gap-2">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label="example.com"
          />
          <input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="443"
            className="w-24 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label="Port number"
          />
          <button type="button" onClick={run} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Ping
          </button>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title="Result">
          <p className="mb-3 text-xs text-ink-faint dark:text-slate-500">{result.method_note}</p>
          <div className="mb-4 grid grid-cols-4 gap-2 text-center">
            <Stat label="Min" value={result.min_ms !== null ? `${result.min_ms}ms` : "—"} />
            <Stat label="Avg" value={result.avg_ms !== null ? `${result.avg_ms}ms` : "—"} />
            <Stat label="Max" value={result.max_ms !== null ? `${result.max_ms}ms` : "—"} />
            <Stat label="Loss" value={`${result.packet_loss_percent}%`} />
          </div>
          <div className="flex gap-1.5">
            {result.attempts.map((a, i) => (
              <div
                key={i}
                className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-mono ${
                  a.success ? "border-accent-500/30 bg-accent-50 text-accent-600 dark:bg-accent-500/10" : "border-danger-500/30 bg-danger-50 text-danger-500 dark:bg-danger-500/10"
                }`}
              >
                {a.success ? `${a.time_ms}ms` : "timeout"}
              </div>
            ))}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-subtle py-2.5 dark:border-slate-800 dark:bg-slate-950">
      <p className="font-mono text-sm font-medium text-ink dark:text-slate-100">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-faint dark:text-slate-600">{label}</p>
    </div>
  );
}
