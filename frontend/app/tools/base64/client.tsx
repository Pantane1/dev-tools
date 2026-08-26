"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface Base64Response {
  result: string;
}

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(nextMode: "encode" | "decode" = mode) {
    setMode(nextMode);
    setError(null);
    if (!input) {
      setOutput("");
      return;
    }
    try {
      const res = await apiPost<Base64Response>("/base64/process", { content: input, mode: nextMode, url_safe: urlSafe });
      setOutput(res.result);
    } catch (err) {
      setOutput("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="Base64 Encoder/Decoder" description="Encode or decode text using standard or URL-safe Base64." />

      <ToolPanel title="Input" className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          aria-label="Text to encode or decode"
          placeholder="Type or paste text…"
          className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => run("encode")} className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Encode
          </button>
          <button type="button" onClick={() => run("decode")} className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900">
            Decode
          </button>
          <label className="flex items-center gap-1.5 text-sm text-ink-muted dark:text-slate-400">
            <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            URL-safe
          </label>
        </div>
      </ToolPanel>

      {error && <ErrorMessage message={error} />}

      {!error && output && (
        <ToolPanel title="Output" actions={<CopyButton value={output} />}>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
            {output}
          </pre>
        </ToolPanel>
      )}
    </div>
  );
}
