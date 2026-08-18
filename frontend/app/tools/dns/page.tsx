"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiGet, ApiError } from "@/lib/api";

interface DnsRecord {
  type: string;
  value: string;
  ttl: number | null;
}
interface DnsLookupResponse {
  domain: string;
  records: DnsRecord[];
}

export default function DnsLookupPage() {
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(null);
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await apiGet<DnsLookupResponse>("/dns/lookup", { domain: domain.trim() });
      setRecords(res.records);
    } catch (err) {
      setRecords([]);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="DNS Lookup" description="Look up A, AAAA, MX, NS, TXT, CNAME, SOA and CAA records for a domain." />

      <ToolPanel title="Domain" className="mb-4">
        <div className="flex gap-2">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={run}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Lookup
          </button>
        </div>
      </ToolPanel>

      {loading && <LoadingState label="Querying DNS…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && records.length > 0 && (
        <ToolPanel title="DNS Records">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint dark:border-slate-800 dark:text-slate-500">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Value</th>
                  <th className="py-2 font-medium">TTL</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 dark:border-slate-800">
                    <td className="py-2 pr-4">
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {r.type}
                      </span>
                    </td>
                    <td className="max-w-md break-all py-2 pr-4 font-mono text-ink dark:text-slate-200">{r.value}</td>
                    <td className="py-2 font-mono text-ink-faint dark:text-slate-500">{r.ttl ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      )}
    </div>
  );
}