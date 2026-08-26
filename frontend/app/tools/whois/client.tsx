"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiGet, ApiError } from "@/lib/api";

interface WhoisResponse {
  domain: string;
  registrar: string | null;
  created: string | null;
  expires: string | null;
  status: string[];
  name_servers: string[];
}

export default function WhoisPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<WhoisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!domain.trim()) return;
    try {
      const res = await apiGet<WhoisResponse>("/whois/lookup", { domain: domain.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="WHOIS Lookup" description="Look up domain registration details via RDAP." />

      <ToolPanel title="Domain" className="mb-4">
        <div className="flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label="example.com"
          />
          <button type="button" onClick={run} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Lookup
          </button>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title="Registration details">
          <dl className="space-y-2.5 text-sm">
            <Row label="Registrar" value={result.registrar ?? "—"} />
            <Row label="Created" value={result.created ? new Date(result.created).toLocaleDateString() : "—"} />
            <Row label="Expires" value={result.expires ? new Date(result.expires).toLocaleDateString() : "—"} />
            <Row label="Status" value={result.status.join(", ") || "—"} />
          </dl>
          {result.name_servers.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">Name Servers</p>
              <div className="flex flex-wrap gap-1.5">
                {result.name_servers.map((ns) => (
                  <span key={ns} className="rounded bg-surface-subtle px-2 py-0.5 font-mono text-xs text-ink dark:bg-slate-950 dark:text-slate-300">
                    {ns}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ToolPanel>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint dark:text-slate-500">{label}</dt>
      <dd className="text-right text-ink dark:text-slate-200">{value}</dd>
    </div>
  );
}
