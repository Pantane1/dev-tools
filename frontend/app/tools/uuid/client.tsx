"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

interface UuidResponse {
  uuids: string[];
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<UuidResponse>("/uuid/generate", { count, uppercase, hyphens });
      setUuids(res.uuids);
    } catch (err) {
      setUuids([]);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const joined = uuids.join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="UUID Generator" description="Generate one or many version 4 UUIDs." />

      <ToolPanel title="Options" className="mb-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <label htmlFor="count" className="font-medium text-ink dark:text-slate-200">How many</label>
              <span className="font-mono text-ink-muted dark:text-slate-400">{count}</span>
            </div>
            <input
              id="count"
              type="range"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>

          <div className="flex items-end gap-5 text-sm">
            <label className="flex items-center gap-2 text-ink-muted dark:text-slate-400">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              Uppercase
            </label>
            <label className="flex items-center gap-2 text-ink-muted dark:text-slate-400">
              <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              Hyphens
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw size={14} />
          Generate
        </button>
      </ToolPanel>

      {loading && <LoadingState label="Generating…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && uuids.length > 0 && (
        <ToolPanel
          title={`${uuids.length} UUID${uuids.length > 1 ? "s" : ""}`}
          actions={
            <>
              <CopyButton value={joined} />
              <DownloadButton value={joined} filename="uuids.txt" />
            </>
          }
        >
          <pre className="max-h-96 overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {joined}
          </pre>
        </ToolPanel>
      )}
    </div>
  );
}
