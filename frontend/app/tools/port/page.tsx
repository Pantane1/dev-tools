"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiGet, ApiError } from "@/lib/api";

interface PortCheckResponse {
  host: string;
  port: number;
  open: boolean;
  response_time_ms: number | null;
}

export default function PortCheckerPage() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("443");
  const [result, setResult] = useState<PortCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!host.trim() || !port.trim()) return;
    try {
      const res = await apiGet<PortCheckResponse>("/port/check", { host: host.trim(), port: port.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="Port Checker" description="Check whether a single port is open on a public host." />

      <ToolPanel title="Target" className="mb-4">
        <div className="flex gap-2">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="443"
            className="w-24 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={run} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Check
          </button>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title="Result">
          <div className={`flex items-center gap-2 text-sm font-medium ${result.open ? "text-accent-600" : "text-danger-500"}`}>
            {result.open ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            Port {result.port} on {result.host} is {result.open ? "open" : "closed or unreachable"}
            {result.response_time_ms !== null && <span className="ml-auto font-normal text-ink-faint dark:text-slate-500">{result.response_time_ms}ms</span>}
          </div>
        </ToolPanel>
      )}
    </div>
  );
}