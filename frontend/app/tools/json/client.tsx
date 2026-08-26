"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingState } from "@/components/LoadingState";
import { apiPost, ApiError } from "@/lib/api";

const EXAMPLE = `{
  "name": "Pantane",
  "role": "developer",
  "tools": ["json", "jwt", "hash"]
}`;

interface FormatResponse {
  formatted: string;
  minified: string;
  size_bytes: number;
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(nextMode: "format" | "minify" = mode) {
    setMode(nextMode);
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost<FormatResponse>("/json/format", { content: input, indent: 2, sort_keys: false });
      setOutput(nextMode === "format" ? res.formatted : res.minified);
    } catch (err) {
      setOutput("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="JSON Formatter" description="Format, minify, and validate JSON — with the exact line and column of any syntax error." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel
          title="Input"
          actions={
            <>
              <button
                type="button"
                onClick={() => setInput(EXAMPLE)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Load example
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  setOutput("");
                  setError(null);
                }}
                className="text-xs font-medium text-ink-faint hover:text-ink-muted dark:hover:text-slate-400"
              >
                Clear
              </button>
            </>
          }
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="JSON input"
          placeholder='{"key": "value"}'
            rows={16}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => run("format")}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Format
            </button>
            <button
              type="button"
              onClick={() => run("minify")}
              className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Minify
            </button>
          </div>
        </ToolPanel>

        <ToolPanel
          title="Output"
          actions={
            <>
              <CopyButton value={output} />
              <DownloadButton value={output} filename="formatted.json" />
            </>
          }
        >
          {loading && <LoadingState label="Formatting…" />}
          {!loading && error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <pre className="max-h-[26rem] overflow-auto rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
              {output || <span className="text-ink-faint dark:text-slate-600">Output will appear here.</span>}
            </pre>
          )}
        </ToolPanel>
      </div>
    </div>
  );
}
