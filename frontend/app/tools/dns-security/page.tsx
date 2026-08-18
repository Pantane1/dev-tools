"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiGet, ApiError } from "@/lib/api";

interface DnsCheckItem {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}
interface DnsSecurityResponse {
  domain: string;
  checks: DnsCheckItem[];
  score: number;
}

const statusIcon = {
  pass: <CheckCircle2 size={16} className="text-accent-600" />,
  warn: <AlertTriangle size={16} className="text-warn-500" />,
  fail: <XCircle size={16} className="text-danger-500" />,
};

export default function DnsSecurityPage() {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("");
  const [result, setResult] = useState<DnsSecurityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(null);
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { domain: domain.trim() };
      if (selector.trim()) params.dkim_selector = selector.trim();
      const res = await apiGet<DnsSecurityResponse>("/dns/security", params);
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = !result ? "" : result.score >= 80 ? "text-accent-600" : result.score >= 50 ? "text-warn-500" : "text-danger-500";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="DNS Security Checker" description="Check SPF, DMARC, DKIM, DNSSEC and CAA records — DNS record inspection only, not cryptographic verification." />

      <ToolPanel title="Domain" className="mb-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <input
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="DKIM selector (optional)"
            className="w-full rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 sm:w-56 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={run}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Check
          </button>
        </div>
      </ToolPanel>

      {loading && <LoadingState label="Checking DNS security records…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-sm font-medium text-ink dark:text-slate-200">DNS Security Score</span>
            <span className={`text-xl font-semibold ${scoreColor}`}>{result.score}/100</span>
          </div>

          {result.checks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mt-0.5 shrink-0">{statusIcon[check.status]}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink dark:text-slate-200">{check.name}</p>
                <p className="mt-0.5 break-all text-xs text-ink-muted dark:text-slate-500">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}