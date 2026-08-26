"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

const ALGORITHMS = ["md5", "sha1", "sha256", "sha384", "sha512"] as const;

interface HashResult {
  algorithm: string;
  hash: string;
}
interface HashResponse {
  results: HashResult[];
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>(["sha256"]);
  const [results, setResults] = useState<HashResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleAlgo(algo: string) {
    setSelected((prev) => (prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]));
  }

  async function run() {
    setError(null);
    if (selected.length === 0) {
      setError("Select at least one algorithm.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost<HashResponse>("/hash/text", { content: input, algorithms: selected });
      setResults(res.results);
    } catch (err) {
      setResults([]);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Hash Generator" description="Generate MD5, SHA-1, SHA-256, SHA-384 or SHA-512 hashes from text." />

      <ToolPanel
        title="Input"
        actions={
          <button
            type="button"
            onClick={() => {
              setInput("");
              setResults([]);
              setError(null);
            }}
            className="text-xs font-medium text-ink-faint hover:text-ink-muted dark:hover:text-slate-400"
          >
            Clear
          </button>
        }
        className="mb-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Text to hash"
          placeholder="Type or paste text to hash…"
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => toggleAlgo(algo)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                selected.includes(algo)
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
              }`}
            >
              {algo}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={run}
          className="mt-4 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Generate hash
        </button>
      </ToolPanel>

      {loading && <LoadingState label="Hashing…" />}
      {!loading && error && <ErrorMessage message={error} />}

      {!loading && results.length > 0 && (
        <div className="space-y-2.5">
          {results.map((r) => (
            <div
              key={r.algorithm}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-subtle px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">{r.algorithm}</p>
                <p className="truncate font-mono text-sm text-ink dark:text-slate-100">{r.hash}</p>
              </div>
              <CopyButton value={r.hash} className="shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
