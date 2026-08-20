"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface HtmlEntityResponse {
  result: string;
}

export default function HtmlEntityPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(mode: "encode" | "decode") {
    setError(null);
    if (!input) {
      setOutput("");
      return;
    }
    try {
      const res = await apiPost<HtmlEntityResponse>("/html-entities/process", { content: input, mode });
      setOutput(res.result);
    } catch (err) {
      setOutput("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ToolHeader name="HTML Entity Encoder/Decoder" description="Encode or decode HTML entities (&lt;, &amp;, &quot;, etc.)." />

      <ToolPanel title="Input" className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="<b>Pantane & Co</b>"
          className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => run("encode")} className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Encode
          </button>
          <button type="button" onClick={() => run("decode")} className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900">
            Decode
          </button>
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