"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiGet, ApiError } from "@/lib/api";

interface SslCheckResponse {
  domain: string;
  valid: boolean;
  issuer: string;
  subject: string;
  san: string[];
  tls_version: string;
  not_before: string;
  not_after: string;
  days_until_expiry: number;
}

export default function SslCheckerPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<SslCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setError(null);
    if (!domain.trim()) return;
    setLoading(true);
    try {
      const res = await apiGet<SslCheckResponse>("/ssl/check", { domain: domain.trim() });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="SSL/TLS Checker" description="Check a domain's certificate validity, issuer, expiry and negotiated TLS version." />

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
          <button
            type="button"
            onClick={run}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Check
          </button>
        </div>
      </ToolPanel>

      {loading && <LoadingState label="Connecting over TLS…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && result && (
        <div className="space-y-4">
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
              result.valid
                ? "border-accent-500/30 bg-accent-50 text-accent-600 dark:bg-accent-500/10"
                : "border-danger-500/30 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-red-400"
            }`}
          >
            {result.valid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {result.valid ? "Certificate valid" : "Certificate not valid"}
            <span className="ml-auto font-normal">
              {result.days_until_expiry >= 0 ? `Expires in ${result.days_until_expiry} days` : `Expired ${Math.abs(result.days_until_expiry)} days ago`}
            </span>
          </div>

          <ToolPanel title="Certificate details">
            <dl className="space-y-2 text-sm">
              <Row label="Subject" value={result.subject} mono />
              <Row label="Issuer" value={result.issuer} mono />
              <Row label="TLS version" value={result.tls_version} />
              <Row label="Valid from" value={new Date(result.not_before).toLocaleDateString()} />
              <Row label="Valid until" value={new Date(result.not_after).toLocaleDateString()} />
              <div>
                <dt className="mb-1.5 text-ink-faint dark:text-slate-500">Subject Alternative Names</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {result.san.map((name) => (
                    <span
                      key={name}
                      className="rounded bg-surface-subtle px-2 py-0.5 font-mono text-xs text-ink dark:bg-slate-950 dark:text-slate-300"
                    >
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </ToolPanel>
        </div>
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
