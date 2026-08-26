"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface KeyValue {
  key: string;
  value: string;
}

interface HttpResult {
  status_code: number;
  status_text: string;
  response_time_ms: number;
  headers: Record<string, string>;
  body: string;
  body_is_json: boolean;
  size_bytes: number;
  truncated: boolean;
}

function toObject(pairs: KeyValue[]): Record<string, string> {
  return Object.fromEntries(pairs.filter((p) => p.key.trim()).map((p) => [p.key, p.value]));
}

export default function ApiTesterPage() {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<KeyValue[]>([{ key: "", value: "" }]);
  const [params, setParams] = useState<KeyValue[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [result, setResult] = useState<HttpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateRow(rows: KeyValue[], setRows: (r: KeyValue[]) => void, index: number, field: "key" | "value", value: string) {
    const next = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    const last = next[next.length - 1];
    if (index === next.length - 1 && last && (last.key || last.value)) {
      next.push({ key: "", value: "" });
    }
    setRows(next);
  }

  async function send() {
    setError(null);
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await apiPost<HttpResult>("/http/request", {
        method,
        url: url.trim(),
        headers: toObject(headers),
        query_params: toObject(params),
        body: ["POST", "PUT", "PATCH"].includes(method) && body.trim() ? body : null,
      });
      setResult(res);
    } catch (err) {
      setResult(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusColor = !result ? "" : result.status_code < 300 ? "text-accent-600" : result.status_code < 400 ? "text-warn-500" : "text-danger-500";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="HTTP Request Tester" description="A lightweight, safe API tester — private IPs, localhost and metadata endpoints are blocked." />

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-brand-500/30 bg-brand-50 px-3.5 py-3 text-sm text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400">
        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
        <span>Requests never follow redirects automatically and can&apos;t target private networks, localhost, or cloud metadata endpoints.</span>
      </div>

      <ToolPanel title="Request" className="mb-4">
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className="rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm font-medium text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/users"
            className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          aria-label="Request URL"
          />
          <button
            type="button"
            onClick={send}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Send
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <KeyValueEditor label="Query Params" rows={params} onChange={(i, f, v) => updateRow(params, setParams, i, f, v)} onRemove={(i) => setParams(params.filter((_, idx) => idx !== i))} />
          <KeyValueEditor label="Headers" rows={headers} onChange={(i, f, v) => updateRow(headers, setHeaders, i, f, v)} onRemove={(i) => setHeaders(headers.filter((_, idx) => idx !== i))} />
        </div>

        {["POST", "PUT", "PATCH"].includes(method) && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">JSON Body</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="JSON Body"
          placeholder='{"key": "value"}'
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        )}
      </ToolPanel>

      {loading && <LoadingState label="Sending request…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && result && (
        <ToolPanel
          title="Response"
          actions={<CopyButton value={result.body} />}
        >
          <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
            <span className={`font-semibold ${statusColor}`}>
              {result.status_code} {result.status_text}
            </span>
            <span className="text-ink-faint dark:text-slate-500">{result.response_time_ms}ms</span>
            <span className="text-ink-faint dark:text-slate-500">{(result.size_bytes / 1024).toFixed(1)} KB{result.truncated ? " (truncated)" : ""}</span>
          </div>

          <details className="mb-3">
            <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">
              Response Headers ({Object.keys(result.headers).length})
            </summary>
            <div className="mt-2 space-y-1 rounded-lg bg-surface-subtle p-3 font-mono text-xs dark:bg-slate-950">
              {Object.entries(result.headers).map(([k, v]) => (
                <div key={k} className="break-all">
                  <span className="text-brand-600 dark:text-brand-400">{k}</span>
                  <span className="text-ink-faint dark:text-slate-600">: </span>
                  <span className="text-ink dark:text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </details>

          <pre className="max-h-[28rem] overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {result.body || <span className="text-ink-faint dark:text-slate-600">(empty response body)</span>}
          </pre>
        </ToolPanel>
      )}
    </div>
  );
}

function KeyValueEditor({
  label,
  rows,
  onChange,
  onRemove,
}: {
  label: string;
  rows: KeyValue[];
  onChange: (index: number, field: "key" | "value", value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">{label}</p>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={row.key}
              onChange={(e) => onChange(i, "key", e.target.value)}
              placeholder="key"
              className="w-1/2 rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="key"
            />
            <input
              value={row.value}
              onChange={(e) => onChange(i, "value", e.target.value)}
              placeholder="value"
              className="w-1/2 rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 font-mono text-xs text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            aria-label="value"
            />
            {i < rows.length - 1 && (
              <button type="button" onClick={() => onRemove(i)} className="shrink-0 text-ink-faint hover:text-danger-500">
                <Trash2 size={14} />
              </button>
            )}
            {i === rows.length - 1 && <span className="w-3.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
