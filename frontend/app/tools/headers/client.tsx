"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

interface HeaderCheckItem {
  name: string;
  present: boolean;
  value: string | null;
  why_it_matters: string;
}
interface HeadersCheckResponse {
  url: string;
  status_code: number;
  checks: HeaderCheckItem[];
  score: number;
}

export default function HeadersCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<HeadersCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(null);
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await apiPost<HeadersCheckResponse>("/headers/check", { url: url.trim() });
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
      <ToolHeader name="HTTP Security Headers Checker" description="Inspect a site's security headers and see what's missing, and why it matters." />

      <ToolPanel title="URL" className="mb-4">
        <div className="flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label="example.com"
          />
          <button
            type="button"
            onClick={run}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Check
          </button>
        </div>
      </ToolPanel>

      {loading && <LoadingState label="Fetching headers…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <span className="text-sm font-medium text-ink dark:text-slate-200">Security Headers Score</span>
            <span className={`text-xl font-semibold ${scoreColor}`}>{result.score}/100</span>
          </div>

          {result.checks.map((check) => (
            <div
              key={check.name}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mt-0.5 shrink-0">
                {check.present ? <CheckCircle2 size={16} className="text-accent-600" /> : <XCircle size={16} className="text-danger-500" />}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm font-medium text-ink dark:text-slate-200">{check.name}</p>
                {check.value && <p className="mt-0.5 break-all font-mono text-xs text-ink-muted dark:text-slate-500">{check.value}</p>}
                <p className="mt-1 text-xs text-ink-faint dark:text-slate-600">{check.why_it_matters}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
