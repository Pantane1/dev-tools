"use client";

import { useState } from "react";
import { Globe, Lock } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiGet, ApiError } from "@/lib/api";

interface IpInfoResponse {
  ip: string;
  version: string;
  classification: string;
  is_public: boolean;
  reverse_dns: string | null;
}

export default function IpInfoPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<IpInfoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!ip.trim()) return;
    try {
      const res = await apiGet<IpInfoResponse>("/ip/info", { ip: ip.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ToolHeader name="IP Information" description="Look up basic classification info for an IPv4 or IPv6 address." />

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
        <ToolPanel title="Result">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            {result.is_public ? <Globe size={16} className="text-accent-600" /> : <Lock size={16} className="text-warn-500" />}
            <span className="capitalize">{result.classification}</span>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="IP address" value={result.ip} mono />
            <Row label="Version" value={result.version} />
            <Row label="Classification" value={result.classification} />
            <Row label="Reverse DNS" value={result.reverse_dns ?? "—"} mono />
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
      <dd className={`text-right capitalize text-ink dark:text-slate-200 ${mono ? "font-mono normal-case" : ""}`}>{value}</dd>
    </div>
  );
}