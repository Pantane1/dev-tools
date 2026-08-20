"use client";

import { useState } from "react";
import { ToolHeader } from "@/components/ToolHeader";
import { ToolPanel } from "@/components/ToolPanel";
import { CopyButton } from "@/components/CopyButton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { apiPost, ApiError } from "@/lib/api";

interface CsvJsonResponse {
  result: string;
}

export default function CsvJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"csv_to_json" | "json_to_csv">("csv_to_json");
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      const res = await apiPost<CsvJsonResponse>("/csv-json/convert", { content: input, direction });
      setOutput(res.result);
    } catch (err) {
      setOutput("");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ToolHeader name="CSV ↔ JSON Converter" description="Convert between CSV and JSON arrays of objects." />

      <div className="mb-4 flex overflow-hidden rounded-lg border border-border dark:border-slate-700" style={{ width: "fit-content" }}>
        <button
          type="button"
          onClick={() => setDirection("csv_to_json")}
          className={`px-3.5 py-2 text-sm font-medium ${direction === "csv_to_json" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-subtle dark:text-slate-400"}`}
        >
          CSV → JSON
        </button>
        <button
          type="button"
          onClick={() => setDirection("json_to_csv")}
          className={`px-3.5 py-2 text-sm font-medium ${direction === "json_to_csv" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-subtle dark:text-slate-400"}`}
        >
          JSON → CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ToolPanel title={direction === "csv_to_json" ? "CSV" : "JSON"}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={run}
            rows={12}
            placeholder={direction === "csv_to_json" ? "name,role\nPantane,developer" : '[{"name": "Pantane", "role": "developer"}]'}
            className="w-full resize-none rounded-lg border border-border bg-surface-subtle p-3 font-mono text-sm text-ink outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="button" onClick={run} className="mt-3 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Convert
          </button>
        </ToolPanel>

        <ToolPanel title={direction === "csv_to_json" ? "JSON" : "CSV"} actions={<CopyButton value={output} />}>
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-subtle p-3 font-mono text-sm text-ink dark:bg-slate-950 dark:text-slate-100">
              {output || <span className="text-ink-faint dark:text-slate-600">Output will appear here.</span>}
            </pre>
          )}
        </ToolPanel>
      </div>
    </div>
  );
}