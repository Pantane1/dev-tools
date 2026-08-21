"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiGet, ApiError } from "@/lib/api";

interface IpLookupResponse {
  ip: string;
  network_name: string | null;
  organization: string | null;
  country: string | null;
  cidr: string | null;
}

export default function IpLookupPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<IpLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!ip.trim()) return;
    try {
      const res = await apiGet<IpLookupResponse>("/ip-lookup/lookup", { ip: ip.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="IP Address Lookup" description="Look up who owns and operates a public IP address, via RDAP." />

      <ToolPanel title="IP Address" className="mb-4">
        <div className="flex gap-2">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="8.8.8.8"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={run} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Lookup
          </button>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && result && (
        <ToolPanel title="Registry details">
          <dl className="space-y-2.5 text-sm">
            <Row label="Organization" value={result.organization ?? "—"} />
            <Row label="Network name" value={result.network_name ?? "—"} />
            <Row label="Country" value={result.country ?? "—"} />
            <Row label="CIDR / range" value={result.cidr ?? "—"} mono />
          </dl>
        </ToolPanel>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint dark:text-slate-500">{label}</dt>
      <dd className={`text-right text-ink dark:text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}